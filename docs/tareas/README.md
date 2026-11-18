# Tareas

> **Actualización de responsables — 2026-11-17:** Alexxe dejó el equipo; Maximiliano es responsable de todas las áreas. La distribución y las referencias a Alexxe que siguen se conservan como antecedente y no asignan trabajo activo. Esto no elimina los requisitos de revisión independiente ni modifica el esquema de firmas 2-de-2.

El trabajo se reparte por la frontera **cadena / servidor**. Las specs de cada hito están en [`odd/specs/`](../../odd/specs/README.md) y la columna "Responsable" de ese índice manda. Listas por persona: [maximiliano.md](maximiliano.md) y [alexxe.md](alexxe.md).

## Áreas

| Área | Paths | Responsable |
|---|---|---|
| **Contratos** | `packages/contracts/` | Maximiliano |
| **Verificador** | `apps/verifier/` | Maximiliano |
| **Relayer, épocas y conciliación con la cadena** | `apps/api/src/relayer/`, `apps/api/src/epochs/` (publicación), `apps/api/src/ledger/` (proyección de eventos) | Maximiliano |
| **Monorepo, dominio y API** | raíz del workspace, `packages/domain/`, `apps/api/` (todo lo demás) | Alexxe |
| **Ingesta y almacenamiento** | `apps/api/src/ingestion/`, `apps/api/src/storage/`, `spikes/s3-extraction/` | Alexxe |
| **PWA del contribuyente** | `apps/contributor-web/` | Alexxe |
| **Agregación, MCP y demo client** | `apps/api/src/aggregation/`, `apps/api/src/mcp/`, `packages/demo-client/` | Alexxe |

Un archivo con un solo dueño lo edita solo él. Si necesitás cambiar algo del área del otro, se lo pedís o lo acuerdan y se anota en su lista de tareas.

## Interfaces compartidas (cambian de a dos)

Estas secciones son el contrato entre las dos áreas. Se cambian **en el mismo commit las dos**, y con el OK del otro integrante en el PR:

- [M1 §3](../../odd/specs/m1-contracts-gate.md#3-interfaces): funciones, eventos, tipos EIP-712, hojas y árbol.
- [M2a §7](../../odd/specs/m2-domain-api-mode-a.md#7-frozen-w3-formats-consumed-by-m1-contracts-m4-and-m5-design): evidence leaf, `evidenceRoot`, `resultHash`, recibo y contribution leaf.
- El fake de `ChainGateway` (`apps/api/test/`) copia los eventos de M1 §3: Alexxe lo mantiene, Maximiliano avisa cualquier cambio.

**Punto de sincronización:** antes de cerrar M1, los dos revisan juntos M1 §3 y M2a §7 y lo dejan anotado en la `## Log` de `odd/tasks/mvp-p0-impl-specs.md`.

## Revisión cruzada

- Lo que mueve fondos o firma (`packages/contracts/`, `apps/verifier/`, relayer) lo revisa **Alexxe** antes de mergear. Es la verificación independiente que pide `mvp-p0.md` (Further Notes).
- Lo que toca datos personales (ingesta, redacción, R2, respuestas al comprador) lo revisa **Maximiliano**.
- El resto: cada uno mergea su PR con los checks en verde.

## Rutina

1. Al empezar: leer el propio `estado.md` y el del otro (`docs/miembros/<slug>/estado.md`).
2. Tomar la próxima tarea sin bloquear de la propia lista; si depende del otro, anotarlo como bloqueo en `estado.md`.
3. Cada commit que toca código lleva su entrada en `bitacora.md` y el `estado.md` al día (lo exige el hook).
4. Al terminar un criterio de aceptación de una spec, marcarlo en la lista de tareas con el commit.

## Onboarding (una vez por compu)

```sh
git config core.hooksPath .githooks   # activa los hooks del equipo
git config tuki.member <tu-slug>      # maximiliano o alexxe
```

Para verificar: `git config tuki.member` muestra tu slug y `git config core.hooksPath` muestra `.githooks`. Cuando M2a cree el `package.json` de la raíz, el `prepare` de pnpm hará el primer paso solo.
