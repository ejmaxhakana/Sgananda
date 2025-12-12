// Load environment variables first
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

// Database setup
const db = new sqlite3.Database("./referrals.db", (err) => {
    if (err) console.error(err);
    console.log("Database connected");
});

// Create table if it doesn't exist
db.run(`
CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    date TEXT NOT NULL,
    redeemed INTEGER DEFAULT 0
)
`);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "mysupersecret",
        resave: false,
        saveUninitialized: true,
    })
);

// Serve user page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "generate.html"));
});

// Serve admin page
app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Generate unique code
function generateCode() {
    return "REF-" + Math.floor(10000 + Math.random() * 90000);
}

// Handle referral submission
app.post("/submit", (req, res) => {
    const { name, phone } = req.body;
    const code = generateCode();

    db.run(
        `INSERT INTO referrals (name, phone, code, date) VALUES (?, ?, ?, datetime('now'))`,
        [name, phone, code],
        function (err) {
            if (err) return res.status(500).json({ error: "Error saving referral." });
            res.json({ code });
        }
    );
});

// Admin login
app.post("/admin-login", (req, res) => {
    const { pass } = req.body;
    if (pass === process.env.ADMIN_PASS) {
        req.session.admin = true;
        return res.json({ ok: true });
    }
    res.status(401).json({ ok: false, error: "Wrong password" });
});

// Get referrals (admin only)
app.get("/admin-data", (req, res) => {
    if (!req.session.admin) return res.status(403).json({ error: "Not authorized" });

    db.all(`SELECT * FROM referrals WHERE redeemed = 0 ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error reading database" });
        res.json(rows);
    });
});

// Redeem referral
app.post("/redeem", (req, res) => {
    if (!req.session.admin) return res.status(403).json({ error: "Not authorized" });

    const { id } = req.body;

    db.run(`UPDATE referrals SET redeemed = 1 WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: "Error redeeming" });
        res.json({ ok: true });
    });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
