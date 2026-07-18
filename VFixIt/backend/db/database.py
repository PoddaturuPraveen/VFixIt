"""
VFixIt  Database Layer (SQLite via Python stdlib)
Handles schema creation, seeding, and connection management.
"""
import sqlite3
import os
import secrets
import bcrypt

DB_PATH = os.path.join(os.path.dirname(__file__), "vfixit.db")


def get_db():
    """Return a new SQLite connection with row_factory so rows behave like dicts."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Create all tables if they do not exist."""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL,
            email      TEXT    NOT NULL UNIQUE COLLATE NOCASE,
            password   TEXT    NOT NULL,
            phone      TEXT,
            role       TEXT    NOT NULL DEFAULT 'user'
                           CHECK(role IN ('user','provider','admin')),
            city       TEXT,
            address    TEXT,
            created_at TEXT    DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS providers (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        INTEGER NOT NULL UNIQUE,
            category       TEXT    NOT NULL,
            skills         TEXT    NOT NULL DEFAULT '',
            experience     INTEGER DEFAULT 0,
            bio            TEXT    DEFAULT '',
            city           TEXT    DEFAULT '',
            price_per_hour REAL    DEFAULT 0,
            verified       INTEGER DEFAULT 0,
            available      INTEGER DEFAULT 1,
            rating         REAL    DEFAULT 0,
            total_reviews  INTEGER DEFAULT 0,
            total_earnings REAL    DEFAULT 0,
            created_at     TEXT    DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS services (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            provider_id  INTEGER NOT NULL,
            title        TEXT    NOT NULL,
            description  TEXT    DEFAULT '',
            category     TEXT    NOT NULL,
            price        REAL    NOT NULL,
            duration_hrs INTEGER DEFAULT 1,
            created_at   TEXT    DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id        INTEGER NOT NULL,
            provider_id    INTEGER NOT NULL,
            service_id     INTEGER,
            booking_date   TEXT    NOT NULL,
            time_slot      TEXT    NOT NULL,
            address        TEXT    NOT NULL,
            city           TEXT    NOT NULL,
            status         TEXT    DEFAULT 'pending'
                               CHECK(status IN ('pending','confirmed','completed','cancelled','rejected')),
            total_amount   REAL    DEFAULT 0,
            notes          TEXT    DEFAULT '',
            user_work_status TEXT  DEFAULT 'pending' CHECK(user_work_status IN ('pending','done','not_done')),
            payment_method TEXT    DEFAULT 'cash',
            reviewed       INTEGER DEFAULT 0,
            created_at     TEXT    DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id)     REFERENCES users(id),
            FOREIGN KEY (provider_id) REFERENCES providers(id),
            FOREIGN KEY (service_id)  REFERENCES services(id)
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id  INTEGER NOT NULL UNIQUE,
            user_id     INTEGER NOT NULL,
            provider_id INTEGER NOT NULL,
            rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            comment     TEXT    DEFAULT '',
            created_at  TEXT    DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id)  REFERENCES bookings(id),
            FOREIGN KEY (user_id)     REFERENCES users(id),
            FOREIGN KEY (provider_id) REFERENCES providers(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL,
            title      TEXT    NOT NULL,
            message    TEXT    NOT NULL,
            type       TEXT    DEFAULT 'info',
            is_read    INTEGER DEFAULT 0,
            created_at TEXT    DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    """)
    conn.commit()
    conn.close()
    print("✅  DB schema ready")


def seed_db():
    """Insert demo data only if admin doesn't already exist."""
    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE role='admin'").fetchone()
    if existing:
        conn.close()
        return

    def hp(pw):
        return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

    # Use fixed passwords for demo accounts to match console output in app.py
    # In production, these should be unique and provided via environment variables
    admin_pw = "admin123"
    user_pw  = "user123"
    prov_pw  = "prov123"

    # Admin
    conn.execute(
        "INSERT INTO users(name,email,password,role,phone,city) VALUES(?,?,?,?,?,?)",
        ("Admin VFixIt", "admin@vfixit.in", hp(admin_pw), "admin", "9000000000", "Hyderabad")
    )

    # Regular users
    u1 = conn.execute(
        "INSERT INTO users(name,email,password,role,phone,city) VALUES(?,?,?,?,?,?)",
        ("Priya Sharma", "priya@gmail.com", hp(user_pw), "user", "9876543210", "Hyderabad")
    ).lastrowid
    conn.execute(
        "INSERT INTO users(name,email,password,role,phone,city) VALUES(?,?,?,?,?,?)",
        ("Rahul Verma", "rahul@gmail.com", hp(user_pw), "user", "9876543211", "Secunderabad")
    )

    # Provider seed data
    providers = [
        ("Ravi Kumar",    "ravi@pro.com",     "9111111111", "Hyderabad",    "Electrician",     "Wiring, Repairs, Solar, CCTV",           8,  350, "8+ years residential & commercial wiring expert.",     4.9, 120),
        ("Suresh Rao",    "suresh@pro.com",   "9111111112", "Hyderabad",    "Plumber",         "Pipe Fitting, Drainage, Leaks",           6,  280, "Reliable plumber, same-day service available.",         4.7, 85),
        ("Anand Pillai",  "anand@pro.com",    "9111111113", "Hyderabad",    "Carpenter",       "Furniture, Doors, Modular Kitchen",       10, 420, "Master carpenter with 10 years in custom interiors.",  4.8, 98),
        ("Vijay Menon",   "vijay@pro.com",    "9111111114", "Hyderabad",    "Painter",         "Interior, Exterior, Texture Paint",       5,  220, "Professional painter, Asian Paints certified.",         4.6, 60),
        ("Srinivas L.",   "srini@pro.com",    "9111111115", "Hyderabad",    "Appliance Repair","AC, Fridge, Washing Machine, Geyser",    7,  450, "Certified appliance tech, all major brands.",           4.9, 140),
        ("Kishore T.",    "kishore@pro.com",  "9111111116", "Secunderabad", "Electrician",     "Wiring, Switchboards, Inverters",         4,  300, "Specialised in inverter & solar installations.",        4.5, 55),
        ("Mohan Reddy",   "mohan@pro.com",    "9111111117", "Warangal",     "Plumber",         "Tanks, Borewells, Bathroom Fittings",     9,  320, "Expert borewell & water tank specialist.",              4.7, 77),
        ("Prakash D.",    "prakash@pro.com",  "9111111118", "Secunderabad", "Painter",         "Wall Painting, Waterproofing",            6,  200, "Quality finishes, waterproofing specialist.",           4.4, 42),
        ("Naren Das",     "naren@pro.com",    "9111111119", "Hyderabad",    "Carpenter",       "Woodwork, Polishing, Repairs",            3,  300, "Young skilled carpenter, quick turnaround.",            4.3, 30),
        ("Srikanth M.",   "srikanth@pro.com", "9111111120", "Warangal",     "Appliance Repair","TV, Microwave, Mixers, Coolers",         5,  380, "Electronics & appliance repair all in one.",            4.6, 65),
    ]

    for (name, email, phone, city, cat, skills, exp, price, bio, rating, rev) in providers:
        uid = conn.execute(
            "INSERT INTO users(name,email,password,role,phone,city) VALUES(?,?,?,?,?,?)",
            (name, email, hp(prov_pw), "provider", phone, city)
        ).lastrowid
        pid = conn.execute(
            "INSERT INTO providers(user_id,category,skills,experience,bio,city,price_per_hour,verified,rating,total_reviews) VALUES(?,?,?,?,?,?,?,1,?,?)",
            (uid, cat, skills, exp, bio, city, price, rating, rev)
        ).lastrowid
        conn.execute(
            "INSERT INTO services(provider_id,title,description,category,price,duration_hrs) VALUES(?,?,?,?,?,?)",
            (pid, f"{cat} Service", f"Professional {cat.lower()} service by {name}", cat, price, 2)
        )

    # Demo completed booking + review for Ravi
    ravi_prov = conn.execute(
        "SELECT p.id FROM providers p JOIN users u ON u.id=p.user_id WHERE u.email='ravi@pro.com'"
    ).fetchone()
    ravi_svc = conn.execute(
        "SELECT id FROM services WHERE provider_id=?", (ravi_prov["id"],)
    ).fetchone()
    bk_id = conn.execute(
        "INSERT INTO bookings(user_id,provider_id,service_id,booking_date,time_slot,address,city,status,total_amount,reviewed) VALUES(?,?,?,?,?,?,?,?,?,?)",
        (u1, ravi_prov["id"], ravi_svc["id"], "2026-03-15", "10:00 AM – 12:00 PM",
         "Flat 4B, Miyapur", "Hyderabad", "completed", 700, 1)
    ).lastrowid
    conn.execute(
        "INSERT INTO reviews(booking_id,user_id,provider_id,rating,comment) VALUES(?,?,?,?,?)",
        (bk_id, u1, ravi_prov["id"], 5, "Excellent work! Very professional and punctual.")
    )

    conn.commit()
    conn.close()
    print("✅  DB seeded successfully.")


def notify(user_id, title, message, ntype="info"):
    """Insert a notification row."""
    conn = get_db()
    conn.execute(
        "INSERT INTO notifications(user_id,title,message,type) VALUES(?,?,?,?)",
        (user_id, title, message, ntype)
    )
    conn.commit()
    conn.close()
