import type { AnchorConfig } from "./config.js";
import { defaultPipelineConfig } from "./config.js";
import { comparisonText } from "./decimal.js";
import { isNumericPath } from "./normalize.js";
import type { AnchoredField, AnchoredTicket, Box, CountryModule, ImageGeometry, NormalizedTicket, OcrLine, Point } from "./types.js";

type Candidate = { index: number; endIndex: number; similarity: number; start: number; end: number; box: Box };
const alphanumerics = (text: string) => comparisonText(text).replace(/[^\p{L}\p{N}]/gu, "");

/** Normalized Levenshtein similarity, without OCR-specific substitutions. */
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1]! + 1, previous[j]! + 1, previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    previous = row;
  }
  return 1 - previous[b.length]! / Math.max(a.length, b.length);
}

function originalBox(boxes: readonly Box[], image: ImageGeometry): Box | null {
  const points: Point[] = [];
  for (const box of boxes) for (const [x, y] of box) {
    const h = image.toOriginal;
    const divisor = h ? h[6] * x + h[7] * y + h[8] : 1;
    const px = h ? (h[0] * x + h[1] * y + h[2]) / divisor : x;
    const py = h ? (h[3] * x + h[4] * y + h[5]) / divisor : y;
    if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
    points.push([px, py]);
  }
  if (!points.length) return null;
  const left = Math.max(0, Math.min(...points.map(p => p[0]))), top = Math.max(0, Math.min(...points.map(p => p[1])));
  const right = Math.min(image.width, Math.max(...points.map(p => p[0]))), bottom = Math.min(image.height, Math.max(...points.map(p => p[1])));
  return right > left && bottom > top ? [[left, top], [right, top], [right, bottom], [left, bottom]] : null;
}

function candidates(raw: string, numeric: boolean, lines: readonly OcrLine[], image: ImageGeometry, config: AnchorConfig): Candidate[] {
  const target = numeric ? alphanumerics(raw) : comparisonText(raw);
  if (!target) return [];
  const result: Candidate[] = [];
  lines.forEach((line, index) => {
    const tokens = [...line.text.matchAll(numeric ? /[\p{L}\p{N}]+/gu : /\S+/gu)];
    let best: Omit<Candidate, "box"> | null = null;
    for (let start = 0; start < tokens.length; start++) {
      for (let end = start; end < tokens.length; end++) {
        const from = tokens[start]!.index, to = tokens[end]!.index + tokens[end]![0].length;
        const text = numeric ? alphanumerics(line.text.slice(from, to)) : comparisonText(line.text.slice(from, to));
        // Extending an already too-long span cannot reach the threshold.
        if (numeric ? text.length > target.length : text.length > target.length / config.doubtfulThreshold) break;
        const score = numeric ? (target === text ? 1 : 0) : similarity(target, text);
        if (score >= (numeric ? 1 : config.doubtfulThreshold) && (!best || score > best.similarity)) best = { index, endIndex: index, similarity: score, start: from, end: to };
      }
    }
    if (best !== null) {
      const match = best as Omit<Candidate, "box">;
      const characters = line.characters?.filter(char => char.start < match.end && char.end > match.start);
      // Use character boxes only when they cover the complete matched span.
      const complete = characters?.length && Math.min(...characters.map(char => char.start)) <= match.start && Math.max(...characters.map(char => char.end)) >= match.end;
      const box = originalBox(complete ? characters!.map(char => char.box) : [line.box], image);
      if (box) result.push({ ...match, box });
    }
  });
  // Wrapped fields are contiguous OCR lines, compared as one text. The
  // threshold itself bounds span length; there is no country-specific limit.
  if (!numeric) for (let start = 0; start < lines.length; start++) {
    let joined = comparisonText(lines[start]!.text);
    for (let end = start + 1; end < lines.length; end++) {
      joined += " " + comparisonText(lines[end]!.text);
      if (joined.length > target.length / config.doubtfulThreshold) break;
      const score = similarity(target, joined);
      if (score < config.doubtfulThreshold) continue;
      const box = originalBox(lines.slice(start, end + 1).map(line => line.box), image);
      if (box) result.push({ index: start, endIndex: end, start: 0, end: lines[end]!.text.length, similarity: score, box });
    }
  }
  return result;
}

export function anchorTicket(ticket: NormalizedTicket, lines: readonly OcrLine[], country: CountryModule, image: ImageGeometry, config: AnchorConfig = defaultPipelineConfig.anchoring): AnchoredTicket {
  if (!Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width <= 0 || image.height <= 0 || new Set(lines.map(line => line.line_id)).size !== lines.length) throw new TypeError("invalid_ocr_geometry");
  if (!(config.doubtfulThreshold > 0 && config.doubtfulThreshold <= config.verifiedThreshold && config.verifiedThreshold <= 1) || !Number.isInteger(config.itemMaxLineDistance) || config.itemMaxLineDistance < 0) throw new TypeError("invalid_anchor_config");
  const campos: Record<string, AnchoredField> = {};
  const associated = new Set<number>();
  const numericUse = new Map<string, Set<number>>();
  const selected = new Map<string, number>();
  const selectedEnds = new Map<string, number>();

  function options(path: string, floor = 0, near?: number): Candidate[] {
    const field = ticket.campos[path]!;
    const numeric = isNumericPath(path), key = alphanumerics(field.raw);
    const used = numericUse.get(key);
    const wordKey = path.startsWith("totales.impuestos.") ? "impuestos" : path.split(".")[1]!;
    const keywords = path.startsWith("totales.") ? country.palabras_clave[wordKey] ?? [] : [];
    const hasKeyword = (candidate: Candidate) => {
      const words: readonly string[] = comparisonText(lines[candidate.index]!.text).match(/[\p{L}\p{N}]+/gu) ?? [];
      return keywords.some(keyword => words.includes(comparisonText(keyword)));
    };
    return candidates(field.raw, numeric, lines, image, config)
      .filter(candidate => candidate.index >= floor && (near === undefined || Math.abs(candidate.index - near) <= config.itemMaxLineDistance))
      .sort((a, b) => Number(used?.has(a.index) ?? false) - Number(used?.has(b.index) ?? false) || Number(hasKeyword(b)) - Number(hasKeyword(a)) || Number(b.similarity >= config.verifiedThreshold) - Number(a.similarity >= config.verifiedThreshold) || a.index - b.index || b.similarity - a.similarity);
  }

  function assign(path: string, candidate?: Candidate): void {
    const field = ticket.campos[path]!;
    const empty = !field.raw.trim();
    const state = empty ? "faltante" : field.valor === null ? "dudoso" : !candidate ? "no_verificado" : candidate.similarity >= config.verifiedThreshold ? "verificado" : "dudoso";
    const supporting = candidate ? lines.slice(candidate.index, candidate.endIndex + 1) : [];
    campos[path] = { ...field, estado: state, line_ids: supporting.map(line => line.line_id), box: candidate?.box ?? null, texto_ocr: supporting.map(line => line.text).join("\n"), similitud: candidate?.similarity ?? 0 };
    if (!candidate) return;
    for (let index = candidate.index; index <= candidate.endIndex; index++) associated.add(index);
    selected.set(path, candidate.index);
    selectedEnds.set(path, candidate.endIndex);
    if (isNumericPath(path) && path !== "comercio.id_fiscal") {
      const key = alphanumerics(field.raw), set = numericUse.get(key) ?? new Set<number>();
      set.add(candidate.index); numericUse.set(key, set);
    }
  }
  // Fiscal metadata is deliberately last: its presence cannot affect scored evidence.
  for (const path of Object.keys(ticket.campos).filter(path => !path.startsWith("items.") && !path.startsWith("totales.") && path !== "comercio.id_fiscal")) assign(path, options(path)[0]);
  let floor = 0;
  for (let index = 0; index < ticket.cantidad_items; index++) {
    const prefix = `items.${index}.`, description = prefix + "descripcion", amount = prefix + "importe";
    let descriptions = options(description, floor);
    const amounts = options(amount, floor);
    // Prefer an available, unused amount/description pair instead of reusing a prior item line.
    const key = alphanumerics(ticket.campos[amount]!.raw), used = numericUse.get(key);
    const pairs = descriptions.flatMap(desc => amounts.filter(value => Math.abs(value.index - desc.index) <= config.itemMaxLineDistance).map(value => ({ desc, value })));
    pairs.sort((a, b) => Number(used?.has(a.value.index) ?? false) - Number(used?.has(b.value.index) ?? false) || Number(b.desc.similarity >= config.verifiedThreshold) - Number(a.desc.similarity >= config.verifiedThreshold) || Math.abs(a.desc.index - a.value.index) - Math.abs(b.desc.index - b.value.index) || a.desc.index - b.desc.index || a.value.index - b.value.index);
    if (pairs[0]) descriptions = [pairs[0].desc];
    assign(description, descriptions[0]);
    const position = selected.get(description);
    assign(amount, pairs[0]?.value ?? options(amount, floor, position)[0]);
    const itemLine = position ?? selected.get(amount);
    for (const name of ["cantidad", "precio_unitario"]) assign(prefix + name, options(prefix + name, floor, itemLine)[0]);
    if (itemLine !== undefined) floor = Math.max(...["descripcion", "importe", "cantidad", "precio_unitario"].map(name => selectedEnds.get(prefix + name) ?? floor));
  }
  for (const path of Object.keys(ticket.campos).filter(path => path.startsWith("totales."))) assign(path, options(path)[0]);
  assign("comercio.id_fiscal", options("comercio.id_fiscal")[0]);
  return { ...ticket, campos, texto_no_interpretado: lines.flatMap((line, index) => associated.has(index) ? [] : [{ ...line, box: originalBox([line.box], image) ?? line.box }]) };
}
