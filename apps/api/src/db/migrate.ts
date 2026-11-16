import { connect, migrateDatabase } from "./database.js";
const url = process.env.DATABASE_URL;
if (!url) { process.stderr.write("database_unavailable\n"); process.exit(1); }
const { client, db } = connect(url);
try { await migrateDatabase(db); }
catch { process.stderr.write("database_unavailable\n"); process.exitCode = 1; }
finally { await client.end(); }
