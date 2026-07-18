"""
VFixIt – Auth Routes
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/change-password
"""
import re
import bcrypt
from flask import Blueprint, request, jsonify, g
from db.database import get_db, notify
from middleware.auth import generate_token, jwt_required

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _safe_user(row: dict) -> dict:
    """Return user dict without password field."""
    return {k: v for k, v in row.items() if k != "password"}


# ── Register ──────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone    = (data.get("phone") or "").strip() or None
    city     = (data.get("city") or "").strip() or None
    address  = (data.get("address") or "").strip() or None
    role     = data.get("role", "user")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email and password are required"}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"success": False, "message": "Invalid email format"}), 400
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    user_role = "provider" if role == "provider" else "user"

    conn = get_db()
    try:
        if conn.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone():
            return jsonify({"success": False, "message": "Email already registered"}), 409

        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        try:
            cur = conn.execute(
                "INSERT INTO users(name,email,password,phone,role,city,address) VALUES(?,?,?,?,?,?,?)",
                (name, email, hashed, phone, user_role, city, address)
            )
        except Exception:
            return jsonify({"success": False, "message": "Email already registered"}), 409
        user_id = cur.lastrowid

        if user_role == "provider":
            category = (data.get("category") or "Electrician").strip()
            skills   = (data.get("skills")   or "").strip()
            price    = float(data.get("price") or 0)
            conn.execute(
                "INSERT INTO providers(user_id,category,skills,city,price_per_hour) VALUES(?,?,?,?,?)",
                (user_id, category, skills, city or "", price)
            )

        conn.commit()
        user = dict(conn.execute(
            "SELECT id,name,email,role,phone,city FROM users WHERE id=?", (user_id,)
        ).fetchone())
        token = generate_token(user["id"], user["role"])
        notify(user_id, "Welcome to VFixIt! 🎉", f"Hi {name}, your account is ready.", "system")
        return jsonify({"success": True, "token": token, "user": user}), 201
    finally:
        conn.close()


# ── Login ─────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if not row or not bcrypt.checkpw(password.encode(), row["password"].encode()):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        user  = _safe_user(dict(row))
        token = generate_token(user["id"], user["role"])
        return jsonify({"success": True, "token": token, "user": user})
    finally:
        conn.close()


# ── Me ────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required
def me():
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id,name,email,role,phone,city,address,created_at FROM users WHERE id=?",
            (g.current_user["id"],)
        ).fetchone()
        return jsonify({"success": True, "user": dict(row)})
    finally:
        conn.close()


# ── Update Profile ────────────────────────────────────────────
@auth_bp.route("/profile", methods=["PUT"])
@jwt_required
def update_profile():
    data    = request.get_json(silent=True) or {}
    name    = (data.get("name")    or "").strip()
    phone   = (data.get("phone")   or "").strip() or None
    city    = (data.get("city")    or "").strip() or None
    address = (data.get("address") or "").strip() or None

    if not name:
        return jsonify({"success": False, "message": "Name is required"}), 400

    conn = get_db()
    try:
        conn.execute(
            "UPDATE users SET name=?,phone=?,city=?,address=? WHERE id=?",
            (name, phone, city, address, g.current_user["id"])
        )
        conn.commit()
        row = conn.execute(
            "SELECT id,name,email,role,phone,city,address FROM users WHERE id=?",
            (g.current_user["id"],)
        ).fetchone()
        return jsonify({"success": True, "message": "Profile updated", "user": dict(row)})
    finally:
        conn.close()


# ── Delete Profile ────────────────────────────────────────────
@auth_bp.route("/profile", methods=["DELETE"])
@jwt_required
def delete_profile():
    conn = get_db()
    try:
        user_id = g.current_user["id"]
        
        # Check if user is a provider to delete their provider-specific dependencies
        prov = conn.execute("SELECT id FROM providers WHERE user_id=?", (user_id,)).fetchone()
        if prov:
            pid = prov["id"]
            conn.execute("DELETE FROM reviews WHERE provider_id=?", (pid,))
            conn.execute("DELETE FROM bookings WHERE provider_id=?", (pid,))
            
        # Delete user's own bookings and reviews
        conn.execute("DELETE FROM reviews WHERE user_id=?", (user_id,))
        conn.execute("DELETE FROM bookings WHERE user_id=?", (user_id,))
        
        # Delete the user (ON DELETE CASCADE handles providers, services, notifications)
        conn.execute("DELETE FROM users WHERE id=?", (user_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Account deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": "Failed to delete account."}), 500
    finally:
        conn.close()


# ── Change Password ───────────────────────────────────────────
@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required
def change_password():
    data        = request.get_json(silent=True) or {}
    current_pw  = data.get("currentPassword") or ""
    new_pw      = data.get("newPassword")      or ""

    if len(new_pw) < 6:
        return jsonify({"success": False, "message": "New password must be at least 6 characters"}), 400

    conn = get_db()
    try:
        row = conn.execute(
            "SELECT password FROM users WHERE id=?", (g.current_user["id"],)
        ).fetchone()
        if not bcrypt.checkpw(current_pw.encode(), row["password"].encode()):
            return jsonify({"success": False, "message": "Current password is incorrect"}), 400

        new_hash = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode()
        conn.execute("UPDATE users SET password=? WHERE id=?", (new_hash, g.current_user["id"]))
        conn.commit()
        return jsonify({"success": True, "message": "Password updated successfully"})
    finally:
        conn.close()
