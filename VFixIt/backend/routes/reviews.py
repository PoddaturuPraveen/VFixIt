"""
VFixIt – Reviews Routes
POST /api/reviews                  – submit review (user, after completion)
GET  /api/reviews/provider/<id>    – list reviews for a provider
"""
from flask import Blueprint, request, jsonify, g
from db.database import get_db
from middleware.auth import jwt_required, role_required

reviews_bp = Blueprint("reviews", __name__)


@reviews_bp.route("/", methods=["POST"])
@jwt_required
@role_required("user")
def submit_review():
    data       = request.get_json(silent=True) or {}
    booking_id = data.get("booking_id")
    rating     = data.get("rating")
    comment    = (data.get("comment") or "").strip()

    if not booking_id or rating is None:
        return jsonify({"success": False, "message": "booking_id and rating are required"}), 400

    rating = int(rating)
    if not (1 <= rating <= 5):
        return jsonify({"success": False, "message": "Rating must be between 1 and 5"}), 400

    conn = get_db()
    try:
        b = conn.execute(
            "SELECT * FROM bookings WHERE id=? AND user_id=?",
            (int(booking_id), g.current_user["id"])
        ).fetchone()
        if not b:
            return jsonify({"success": False, "message": "Booking not found"}), 404
        if b["status"] != "completed":
            return jsonify({"success": False,
                            "message": "Reviews are only allowed after service completion"}), 400
        if b["reviewed"]:
            return jsonify({"success": False, "message": "You have already reviewed this booking"}), 409

        cur = conn.execute(
            "INSERT INTO reviews(booking_id,user_id,provider_id,rating,comment) VALUES(?,?,?,?,?)",
            (int(booking_id), g.current_user["id"], b["provider_id"], rating, comment)
        )
        conn.execute("UPDATE bookings SET reviewed=1 WHERE id=?", (int(booking_id),))

        # Recalculate provider average rating
        agg = conn.execute(
            "SELECT ROUND(AVG(CAST(rating AS REAL)),1) AS avg_r, COUNT(*) AS cnt "
            "FROM reviews WHERE provider_id=?",
            (b["provider_id"],)
        ).fetchone()
        conn.execute(
            "UPDATE providers SET rating=?, total_reviews=? WHERE id=?",
            (agg["avg_r"] or 0, agg["cnt"], b["provider_id"])
        )
        conn.commit()
        return jsonify({"success": True, "message": "Review submitted successfully",
                        "id": cur.lastrowid}), 201
    finally:
        conn.close()


@reviews_bp.route("/provider/<int:provider_id>", methods=["GET"])
def provider_reviews(provider_id):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT r.*, u.name AS user_name FROM reviews r "
            "JOIN users u ON u.id=r.user_id "
            "WHERE r.provider_id=? ORDER BY r.created_at DESC",
            (provider_id,)
        ).fetchall()
        return jsonify({"success": True, "data": [dict(r) for r in rows]})
    finally:
        conn.close()
