import { ResultSet, createClient } from '@libsql/client';
// import { createClient } from '@libsql/client/web';

const turso = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
});

// turso.execute('DROP TABLE users;')

// turso.execute(`INSERT INTO users (username, salt, iv, vault) VALUES ('testUsername', 'testSalt', 'testIv', 'testVaultContent')`)

turso.execute(`CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE NOT NULL,
salt TEXT UNIQUE NOT NULL,
iv TEXT NOT NULL,
vault TEXT NOT NULL
);`)

function toObject(dbResult: ResultSet) {
  return dbResult.rows.map((row) => {
    let result: { [key: string]: any } = {};
    for (let i = 0; i < row.length; i++) {
      result[dbResult.columns[i]] = row[i]
    }
    return result
  })
}

export {
  turso,
  toObject,
}
