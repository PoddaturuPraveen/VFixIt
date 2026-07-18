"""
VFixIt – Admin Routes  (all require admin role)
GET    /api/admin/dashboard
GET    /api/admin/users
DELETE /api/admin/users/<id>
GET    /api/admin/providers
PATCH  /api/admin/providers/<id>/verify
GET    /api/admin/bookings
PATCH  /api/admin/bookings/<id>/status
"""
from flask import Blueprint, request, jsonify, g
from db.database import get_db, notify
from middleware.auth import jwt_required, role_required

admin_bp = Blueprint("admin", __name__)
A = [jwt_required, role_required("admin")]   # shorthand — applied per route below


def _admin(f):
    """Apply both jwt_required and role_required('admin') at once."""
    return jwt_required(role_required("admin")(f))


# ── Dashboard ─────────────────────────────────────────────────
@admin_bp.route("/dashboard", methods=["GET"])
@_admin
def dashboard():
    conn = get_db()
    try:
        def count(sql, *p):
            return conn.execute(sql, p).fetchone()[0]

        stats = {
            "totalUsers":         count("SELECT COUNT(*) FROM users WHERE role='user'"),
            "totalProviders":     count("SELECT COUNT(*) FROM providers"),
            "verifiedProviders":  count("SELECT COUNT(*) FROM providers WHERE verified=1"),
            "pendingProviders":   count("SELECT COUNT(*) FROM providers WHERE verified=0"),
            "totalBookings":      count("SELECT COUNT(*) FROM bookings"),
            "completedBookings":  count("SELECT COUNT(*) FROM bookings WHERE status='completed'"),
            "pendingBookings":    count("SELECT COUNT(*) FROM bookings WHERE status='pending'"),
            "totalRevenue":       round(conn.execute(
                                      "SELECT COALESCE(SUM(total_earnings),0) FROM providers"
                                  ).fetchone()[0]),
            "totalReviews":       count("SELECT COUNT(*) FROM reviews"),
            "avgRating":          round((conn.execute(
                                      "SELECT COALESCE(AVG(CAST(rating AS REAL)),0) FROM reviews"
                                  ).fetchone()[0]) * 10) / 10,
        }

        recent_bookings = [dict(r) for r in conn.execute(
            "SELECT b.id, b.booking_date, b.status, b.total_amount, b.created_at, "
            "cu.name AS user_name, pu.name AS provider_name, p.category "
            "FROM bookings b "
            "JOIN users cu ON cu.id=b.user_id "
            "JOIN providers p ON p.id=b.provider_id "
            "JOIN users pu ON pu.id=p.user_id "
            "ORDER BY b.created_at DESC LIMIT 10"
        ).fetchall()]

        recent_users = [dict(r) for r in conn.execute(
            "SELECT id, name, email, role, city, created_at FROM users ORDER BY created_at DESC LIMIT 6"
        ).fetchall()]

        return jsonify({"success": True, "data": {
            "stats": stats, "recentBookings": recent_bookings, "recentUsers": recent_users
        }})
    finally:
        conn.close()


# ── Users ─────────────────────────────────────────────────────
@admin_bp.route("/users", methods=["GET"])
@_admin
def list_users():
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT id,name,email,role,phone,city,created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
        return jsonify({"success": True, "data": [dict(r) for r in rows]})
    finally:
        conn.close()


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@_admin
def delete_user(user_id):
    conn = get_db()
    try:
        row = conn.execute("SELECT role FROM users WHERE id=?", (user_id,)).fetchone()
        if not row:
            return jsonify({"success": False, "message": "User not found"}), 404
        if row["role"] == "admin":
            return jsonify({"success": False, "message": "Cannot delete admin account"}), 400
        conn.execute("DELETE FROM users WHERE id=?", (user_id,))
        conn.commit()
        return jsonify({"success": True, "message": "User deleted"})
    finally:
        conn.close()


# ── Providers ─────────────────────────────────────────────────
@admin_bp.route("/providers", methods=["GET"])
@_admin
def list_providers():
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT p.*, u.name, u.email, u.phone "
            "FROM providers p JOIN users u ON u.id=p.user_id "
            "ORDER BY p.verified ASC, p.created_at DESC"
        ).fetchall()
        return jsonify({"success": True, "data": [dict(r) for r in rows]})
    finally:
        conn.close()


@admin_bp.route("/providers/<int:provider_id>/verify", methods=["PATCH"])
@_admin
def verify_provider(provider_id):
    data     = request.get_json(silent=True) or {}
    verified = 1 if data.get("verified") else 0
    conn = get_db()
    try:
        conn.execute(
            "UPDATE providers SET verified=? WHERE id=?", (verified, provider_id)
        )
        conn.commit()
        p = conn.execute(
            "SELECT user_id FROM providers WHERE id=?", (provider_id,)
        ).fetchone()
        if p:
            msg = ("Your provider account has been verified! You can now accept bookings."
                   if verified else "Your verification has been revoked.")
            title = "Account Verified ✅" if verified else "Verification Revoked"
            notify(p["user_id"], title, msg, "system")
        action = "verified" if verified else "unverified"
        return jsonify({"success": True, "message": f"Provider {action}"})
    finally:
        conn.close()


# ── Bookings ──────────────────────────────────────────────────
@admin_bp.route("/bookings", methods=["GET"])
@_admin
def list_bookings():
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT b.*, cu.name AS user_name, pu.name AS provider_name, p.category "
            "FROM bookings b "
            "JOIN users cu ON cu.id=b.user_id "
            "JOIN providers p ON p.id=b.provider_id "
            "JOIN users pu ON pu.id=p.user_id "
            "ORDER BY b.created_at DESC"
        ).fetchall()
        return jsonify({"success": True, "data": [dict(r) for r in rows]})
    finally:
        conn.close()


@admin_bp.route("/bookings/<int:booking_id>/status", methods=["PATCH"])
@_admin
def update_booking_status(booking_id):
    data   = request.get_json(silent=True) or {}
    status = (data.get("status") or "").strip()
    valid  = ("pending", "confirmed", "completed", "cancelled", "rejected")
    if status not in valid:
        return jsonify({"success": False, "message": f"Invalid status '{status}'"}), 400

    conn = get_db()
    try:
        b = conn.execute(
            "SELECT * FROM bookings WHERE id=?", (booking_id,)
        ).fetchone()
        if not b:
            return jsonify({"success": False, "message": "Booking not found"}), 404
        b = dict(b)

        conn.execute("UPDATE bookings SET status=? WHERE id=?", (status, booking_id))
        if status == "completed":
            conn.execute(
                "UPDATE providers SET total_earnings=total_earnings+? WHERE id=?",
                (b["total_amount"], b["provider_id"])
            )
        conn.commit()
        notify(b["user_id"], "Booking Update",
               f"Your booking on {b['booking_date']} is now {status}.", "booking")
        return jsonify({"success": True, "message": f"Booking status set to {status}"})
    finally:
        conn.close()
