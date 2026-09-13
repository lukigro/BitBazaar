import express from "express";
import cors from "cors";
import crypto from "crypto";
import db, { changeBalance } from "./db.js";

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" }));

const START_BALANCE = 1000;

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function sendError(res, status, message) {
  return res.status(status).json({ error: { status: status, message: message } });
}

function publicUser(user) {
  return { id: user.id, username: user.username, balance: user.balance };
}

app.post("/api/users", (req, res) => {

  const username = (req.body.username || "").trim();
  const password = req.body.password;

  if (!username || !password) {
    return sendError(res, 400, "Username and password are required");
  }

  const existing = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (existing) {
    return sendError(res, 400, "Username is already taken");
  }

  const result = db
    .prepare("INSERT INTO users (username, password, balance) VALUES (?, ?, ?)")
    .run(username, hashPassword(password), 0);

  changeBalance(result.lastInsertRowid, START_BALANCE, "SIGNUP_BONUS", "Welcome bonus");

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ data: publicUser(user) });
});

app.post("/api/sessions", (req, res) => {
  const username = (req.body.username || "").trim();
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (!user || user.password !== hashPassword(req.body.password)) {
    return sendError(res, 401, "Wrong username or password");
  }

  res.json({ data: publicUser(user) });
});

app.get("/api/users/:id", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(req.params.id));
  if (!user) {
    return sendError(res, 404, "User not found");
  }
  res.json({ data: publicUser(user) });
});

app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users ORDER BY balance DESC LIMIT 10").all();
  res.json({ data: users.map(publicUser) });
});

app.get("/api/users/:id/transactions", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC")
    .all(Number(req.params.id));
  res.json({ data: rows });
});

app.get("/api/users/:id/rounds", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM rounds WHERE user_id = ? ORDER BY id DESC LIMIT 20")
    .all(Number(req.params.id));
  res.json({ data: rows });
});

app.get("/api/users/:id/offers", (req, res) => {
  const rows = db
    .prepare(
      `SELECT offers.*, listings.title AS listing_title
       FROM offers
       JOIN listings ON listings.id = offers.listing_id
       WHERE offers.buyer_id = ?
       ORDER BY offers.id DESC`
    )
    .all(Number(req.params.id));
  res.json({ data: rows });
});

app.get("/api/listings", (req, res) => {
  const search = req.query.search ? "%" + req.query.search + "%" : "%";

  const rows = db
    .prepare(
      `SELECT listings.*, users.username AS seller_name
       FROM listings
       JOIN users ON users.id = listings.seller_id
       WHERE listings.status = 'ACTIVE' AND listings.title LIKE ?
       ORDER BY listings.id DESC`
    )
    .all(search);

  res.json({ data: rows });
});

app.get("/api/users/:id/inventory", (req, res) => {
  const rows = db
    .prepare(
      `SELECT listings.*, users.username AS bought_from
       FROM listings
       JOIN users ON users.id = listings.seller_id
       WHERE listings.buyer_id = ? AND listings.status = 'SOLD'
       ORDER BY listings.id DESC`
    )
    .all(Number(req.params.id));
  res.json({ data: rows });
});

app.post("/api/listings/:id/relist", (req, res) => {
  const old = db.prepare("SELECT * FROM listings WHERE id = ?").get(Number(req.params.id));
  const ownerId = req.body.ownerId;
  const price = Number(req.body.price);

  if (!old) {
    return sendError(res, 404, "Listing not found");
  }
  if (old.buyer_id !== ownerId || old.status !== "SOLD") {
    return sendError(res, 400, "You do not own this item");
  }
  if (!price || price <= 0) {
    return sendError(res, 400, "The price must be positive");
  }

  const result = db
    .prepare(
      "INSERT INTO listings (seller_id, title, description, price, image, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')"
    )
    .run(ownerId, old.title, old.description, price, old.image);

  db.prepare("UPDATE listings SET status = 'RELISTED' WHERE id = ?").run(old.id);

  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ data: listing });
});

app.get("/api/listings/seller/:id", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM listings WHERE seller_id = ? ORDER BY id DESC")
    .all(Number(req.params.id));
  res.json({ data: rows });
});

app.get("/api/listings/:id", (req, res) => {
  const listing = db
    .prepare(
      `SELECT listings.*, users.username AS seller_name
       FROM listings
       JOIN users ON users.id = listings.seller_id
       WHERE listings.id = ?`
    )
    .get(Number(req.params.id));

  if (!listing) {
    return sendError(res, 404, "Listing not found");
  }
  res.json({ data: listing });
});

app.post("/api/listings", (req, res) => {
  const sellerId = req.body.sellerId;
  const title = req.body.title;
  const price = Number(req.body.price);

  if (!sellerId || !title || !price || price <= 0) {
    return sendError(res, 400, "Seller, title and a positive price are required");
  }

  const result = db
    .prepare(
      "INSERT INTO listings (seller_id, title, description, price, image, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')"
    )
    .run(sellerId, title, req.body.description, price, req.body.image);

  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ data: listing });
});

app.delete("/api/listings/:id", (req, res) => {
  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(Number(req.params.id));
  if (!listing) {
    return sendError(res, 404, "Listing not found");
  }

  db.prepare("DELETE FROM listings WHERE id = ?").run(listing.id);
  db.prepare("DELETE FROM offers WHERE listing_id = ?").run(listing.id);
  res.status(204).send();
});

app.post("/api/listings/:id/purchase", (req, res) => {
  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(Number(req.params.id));
  const buyer = db.prepare("SELECT * FROM users WHERE id = ?").get(req.body.buyerId);

  if (!listing || !buyer) {
    return sendError(res, 404, "Listing or user not found");
  }
  if (listing.status !== "ACTIVE") {
    return sendError(res, 400, "This listing is already sold");
  }
  if (listing.seller_id === buyer.id) {
    return sendError(res, 400, "You cannot buy your own listing");
  }
  if (buyer.balance < listing.price) {
    return sendError(res, 400, "Not enough credits");
  }

  sell(listing, buyer.id, listing.price);
  res.json({ data: { message: "Purchase successful" } });
});

app.get("/api/listings/:id/offers", (req, res) => {
  const rows = db
    .prepare(
      `SELECT offers.*, users.username AS buyer_name
       FROM offers
       JOIN users ON users.id = offers.buyer_id
       WHERE offers.listing_id = ?
       ORDER BY offers.id DESC`
    )
    .all(Number(req.params.id));
  res.json({ data: rows });
});

app.post("/api/listings/:id/offers", (req, res) => {
  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(Number(req.params.id));
  const buyer = db.prepare("SELECT * FROM users WHERE id = ?").get(req.body.buyerId);
  const price = Number(req.body.price);

  if (!listing || !buyer) {
    return sendError(res, 404, "Listing or user not found");
  }
  if (listing.status !== "ACTIVE") {
    return sendError(res, 400, "This listing is already sold");
  }
  if (listing.seller_id === buyer.id) {
    return sendError(res, 400, "You cannot make an offer on your own listing");
  }
  if (!price || price <= 0) {
    return sendError(res, 400, "The offered price must be positive");
  }

  const result = db
    .prepare(
      "INSERT INTO offers (listing_id, buyer_id, price, message, status) VALUES (?, ?, ?, ?, 'OPEN')"
    )
    .run(listing.id, buyer.id, price, req.body.message);

  const offer = db.prepare("SELECT * FROM offers WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ data: offer });
});

app.post("/api/offers/:id/accept", (req, res) => {
  const offer = db.prepare("SELECT * FROM offers WHERE id = ?").get(Number(req.params.id));
  if (!offer || offer.status !== "OPEN") {
    return sendError(res, 404, "Offer not found");
  }

  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(offer.listing_id);
  const buyer = db.prepare("SELECT * FROM users WHERE id = ?").get(offer.buyer_id);

  if (listing.status !== "ACTIVE") {
    return sendError(res, 400, "This listing is already sold");
  }
  if (buyer.balance < offer.price) {
    return sendError(res, 400, "The buyer does not have enough credits any more");
  }

  sell(listing, buyer.id, offer.price);
  db.prepare("UPDATE offers SET status = 'ACCEPTED' WHERE id = ?").run(offer.id);

  db.prepare("UPDATE offers SET status = 'REJECTED' WHERE listing_id = ? AND status = 'OPEN'").run(
    listing.id
  );

  res.json({ data: { message: "Offer accepted" } });
});

app.post("/api/offers/:id/reject", (req, res) => {
  const offer = db.prepare("SELECT * FROM offers WHERE id = ?").get(Number(req.params.id));
  if (!offer) {
    return sendError(res, 404, "Offer not found");
  }

  db.prepare("UPDATE offers SET status = 'REJECTED' WHERE id = ?").run(offer.id);
  res.json({ data: { message: "Offer rejected" } });
});

function sell(listing, buyerId, price) {
  changeBalance(buyerId, -price, "PURCHASE", "Bought: " + listing.title);
  changeBalance(listing.seller_id, price, "SALE", "Sold: " + listing.title);
  db.prepare("UPDATE listings SET status = 'SOLD', buyer_id = ? WHERE id = ?").run(
    buyerId,
    listing.id
  );
}

const SLOT_SYMBOLS = ["cherry", "lemon", "bell", "star", "seven"];
const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
];

app.post("/api/rounds", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.body.userId);
  const bet = Number(req.body.bet);
  const game = req.body.game;

  if (!user) {
    return sendError(res, 404, "User not found");
  }
  if (!bet || bet <= 0) {
    return sendError(res, 400, "The bet must be positive");
  }
  if (user.balance < bet) {
    return sendError(res, 400, "Not enough credits");
  }

  let result = "";
  let payout = 0;

  if (game === "slots") {
    const reels = [];
    for (let i = 0; i < 3; i++) {
      reels.push(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
    }

    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      payout = bet * 10;
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
      payout = bet;
    }

    result = reels.join(",");
  } else if (game === "roulette") {
    const number = Math.floor(Math.random() * 37);
    const color = number === 0 ? "green" : RED_NUMBERS.includes(number) ? "red" : "black";
    const choice = req.body.choice;

    if (choice === "red" || choice === "black") {
      if (choice === color) {
        payout = bet * 2;
      }
    } else if (choice === "even" || choice === "odd") {
      if (number !== 0 && (number % 2 === 0 ? "even" : "odd") === choice) {
        payout = bet * 2;
      }
    } else if (Number(choice) === number) {
      payout = bet * 36;
    }

    result = number + "," + color;
  } else {
    return sendError(res, 400, "Unknown game");
  }

  changeBalance(user.id, -bet, "BET", game + " bet");
  if (payout > 0) {
    changeBalance(user.id, payout, "PAYOUT", game + " win");
  }

  const insert = db
    .prepare(
      "INSERT INTO rounds (user_id, game, bet, result, payout, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(user.id, game, bet, result, payout, new Date().toISOString());

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);

  res.status(201).json({
    data: {
      id: insert.lastInsertRowid,
      game: game,
      bet: bet,
      result: result,
      payout: payout,
      balance: updated.balance
    }
  });
});

app.listen(3000, () => {
  console.log("Casino API running on http://localhost:3000");
});
