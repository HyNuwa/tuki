import { buildServer } from "./server.js";
import { Service } from "./service.js";

const salt = process.env.BUYER_KEY_SALT;
if (!salt) {
  console.error("Falta BUYER_KEY_SALT (ver .env.example)");
  process.exit(1);
}

const app = buildServer(new Service(salt));
const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: "0.0.0.0" });
console.log(`API escuchando en http://localhost:${port} (almacenamiento EN MEMORIA, solo desarrollo)`);
