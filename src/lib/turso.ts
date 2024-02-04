import { createClient } from "@libsql/client";
// import { createClient } from "@libsql/client/web";

const turso = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
});

turso.execute(`CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user TEXT NOT NULL,
data TEXT NOT NULL
);`)

export {
  turso
}
