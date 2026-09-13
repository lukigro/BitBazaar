import Database from "better-sqlite3";

const db = new Database("casino.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password TEXT NOT NULL,
    balance INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image TEXT,
    status TEXT NOT NULL,
    buyer_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    price INTEGER NOT NULL,
    message TEXT,
    status TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game TEXT NOT NULL,
    bet INTEGER NOT NULL,
    result TEXT NOT NULL,
    payout INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    info TEXT,
    created_at TEXT NOT NULL
  );
`);

export function changeBalance(userId, amount, type, info) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  const newBalance = user.balance + amount;

  db.prepare("UPDATE users SET balance = ? WHERE id = ?").run(newBalance, userId);

  db.prepare(
    "INSERT INTO transactions (user_id, type, amount, balance_after, info, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(userId, type, amount, newBalance, info, new Date().toISOString());

  return newBalance;
}

export default db;
