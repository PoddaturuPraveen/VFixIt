"""
VFixIt – Providers Routes
GET  /api/providers                 – public search & filter
GET  /api/providers/my/dashboard    – provider's own dashboard
PUT  /api/providers/my/profile      – update provider profile
POST /api/providers/my/services     – add service
DEL  /api/providers/my/services/<id>– remove service
GET  /api/providers/<id>            – public profile
"""
from flask import Blueprint, request, jsonify, g
from db.database import get_db
from middleware.auth import jwt_required, role_required

providers_bp = Blueprint("providers", __name__)


# ── Public search ─────────────────────────────────────────────
@providers_bp.route("/", methods=["GET"])
def search_providers():
    category  = request.args.get("category",  "").strip()
    city      = request.args.get("city",       "").strip()
    sort      = request.args.get("sort",       "rating")
    min_price = request.args.get("min_price",  type=float)
    max_price = request.args.get("max_price",  type=float)
    search    = request.args.get("search",    "").strip()

    sql    = ("SELECT p.*, u.name, u.email, u.phone "
              "FROM providers p JOIN users u ON u.id=p.user_id "
              "WHERE p.verified=1")
    params = []

    if category:
        sql += " AND p.category=?";      params.append(category)
    if city:
        sql += " AND (p.city LIKE ? OR u.city LIKE ?)"; params += [f"%{city}%", f"%{city}%"]
    if min_price is not None:
        sql += " AND p.price_per_hour>=?"; params.append(min_price)
    if max_price is not None:
        sql += " AND p.price_per_hour<=?"; params.append(max_price)
    if search:
        s = f"%{search}%"
        sql += " AND (u.name LIKE ? OR p.skills LIKE ? OR p.category LIKE ?)"; params += [s, s, s]

    sort_map = {
        "rating":     " ORDER BY p.rating DESC, p.total_reviews DESC",
        "price_asc":  " ORDER BY p.price_per_hour ASC",
        "price_desc": " ORDER BY p.price_per_hour DESC",
        "experience": " ORDER BY p.experience DESC",
    }
    sql += sort_map.get(sort, sort_map["rating"])

    conn = get_db()
    try:
        rows = conn.execute(sql, params).fetchall()
        return jsonify({"success": True, "data": [dict(r) for r in rows]})
    finally:
        conn.close()


# ── Provider own dashboard ─────────────────────────────────────
@providers_bp.route("/my/dashboard", methods=["GET"])
@jwt_required
@role_required("provider")
def my_dashboard():
    conn = get_db()
    try:
        p = conn.execute(
            "SELECT * FROM providers WHERE user_id=?", (g.current_user["id"],)
        ).fetchone()
        if not p:
            return jsonify({"success": False, "message": "Provider profile not found"}), 404

        p = dict(p)
        services = [dict(r) for r in conn.execute(
            "SELECT * FROM services WHERE provider_id=?", (p["id"],)
        ).fetchall()]
        bookings = [dict(r) for r in conn.execute(
            "SELECT b.*, u.name AS user_name, u.phone AS user_phone "
            "FROM bookings b JOIN users u ON u.id=b.user_id "
            "WHERE b.provider_id=? ORDER BY b.created_at DESC",
            (p["id"],)
        ).fetchall()]

        stats = {
            "total":     len(bookings),
            "pending":   sum(1 for b in bookings if b["status"] == "pending"),
            "confirmed": sum(1 for b in bookings if b["status"] == "confirmed"),
            "completed": sum(1 for b in bookings if b["status"] == "completed"),
            "cancelled": sum(1 for b in bookings if b["status"] in ("cancelled", "rejected")),
            "earnings":  p["total_earnings"],
        }
        return jsonify({"success": True, "data": {
            "provider": p, "services": services, "bookings": bookings, "stats": stats
        }})
    finally:
        conn.close()


# ── Update provider profile ───────────────────────────────────
@providers_bp.route("/my/profile", methods=["PUT"])
@jwt_required
@role_required("provider")
def update_my_profile():
    data = request.get_json(silent=True) or {}
    conn = get_db()
    try:
        p = conn.execute(
            "SELECT id FROM providers WHERE user_id=?", (g.current_user["id"],)
        ).fetchone()
        if not p:
            return jsonify({"success": False, "message": "Provider profile not found"}), 404

        conn.execute(
            "UPDATE providers SET skills=?,experience=?,bio=?,city=?,price_per_hour=?,category=?,available=? WHERE user_id=?",
            (
                data.get("skills",        ""),
                int(data.get("experience", 0)),
                data.get("bio",           ""),
                data.get("city",          ""),
                float(data.get("price_per_hour", 0)),
                data.get("category",      "Electrician"),
                1 if data.get("available", True) else 0,
                g.current_user["id"],
            )
        )
        conn.commit()
        updated = dict(conn.execute(
            "SELECT * FROM providers WHERE user_id=?", (g.current_user["id"],)
        ).fetchone())
        return jsonify({"success": True, "message": "Profile updated", "data": updated})
    finally:
        conn.close()


# ── Add service ───────────────────────────────────────────────
@providers_bp.route("/my/services", methods=["POST"])
@jwt_required
@role_required("provider")
def add_service():
    data = request.get_json(silent=True) or {}
    title    = (data.get("title")    or "").strip()
    category = (data.get("category") or "").strip()
    price    = data.get("price")

    if not title or not category or price is None:
        return jsonify({"success": False, "message": "title, category and price are required"}), 400

    conn = get_db()
    try:
        p = conn.execute(
            "SELECT id FROM providers WHERE user_id=?", (g.current_user["id"],)
        ).fetchone()
        if not p:
            return jsonify({"success": False, "message": "Provider not found"}), 404

        cur = conn.execute(
            "INSERT INTO services(provider_id,title,description,category,price,duration_hrs) VALUES(?,?,?,?,?,?)",
            (p["id"], title, data.get("description",""), category,
             float(price), int(data.get("duration_hrs", 1)))
        )
        conn.commit()
        return jsonify({"success": True, "message": "Service added", "id": cur.lastrowid}), 201
    finally:
        conn.close()


# ── Delete service ────────────────────────────────────────────
@providers_bp.route("/my/services/<int:svc_id>", methods=["DELETE"])
@jwt_required
@role_required("provider")
def delete_service(svc_id):
    conn = get_db()
    try:
        p = conn.execute(
            "SELECT id FROM providers WHERE user_id=?", (g.current_user["id"],)
        ).fetchone()
        conn.execute(
            "DELETE FROM services WHERE id=? AND provider_id=?", (svc_id, p["id"])
        )
        conn.commit()
        return jsonify({"success": True, "message": "Service removed"})
    finally:
        conn.close()


# ── Public single provider profile ───────────────────────────
@providers_bp.route("/<int:provider_id>", methods=["GET"])
def get_provider(provider_id):
    conn = get_db()
    try:
        p = conn.execute(
            "SELECT p.*, u.name, u.email, u.phone "
            "FROM providers p JOIN users u ON u.id=p.user_id "
            "WHERE p.id=?",
            (provider_id,)
        ).fetchone()
        if not p:
            return jsonify({"success": False, "message": "Provider not found"}), 404

        p = dict(p)
        p["services"] = [dict(r) for r in conn.execute(
            "SELECT * FROM services WHERE provider_id=?", (provider_id,)
        ).fetchall()]
        p["reviews"] = [dict(r) for r in conn.execute(
            "SELECT r.*, u.name AS user_name FROM reviews r "
            "JOIN users u ON u.id=r.user_id "
            "WHERE r.provider_id=? ORDER BY r.created_at DESC LIMIT 20",
            (provider_id,)
        ).fetchall()]
        return jsonify({"success": True, "data": p})
    finally:
        conn.close()
