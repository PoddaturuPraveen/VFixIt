"""
VFixIt – Notifications Routes
GET    /api/notifications           – list my notifications
PATCH  /api/notifications/read-all  – mark all as read
PATCH  /api/notifications/<id>/read – mark one as read
"""
from flask import Blueprint, jsonify, g
from db.database import get_db
from middleware.auth import jwt_required

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/", methods=["GET"])
@jwt_required
def list_notifications():
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30",
            (g.current_user["id"],)
        ).fetchall()
        unread = conn.execute(
            "SELECT COUNT(*) AS c FROM notifications WHERE user_id=? AND is_read=0",
            (g.current_user["id"],)
        ).fetchone()["c"]
        return jsonify({"success": True, "data": [dict(r) for r in rows], "unread": unread})
    finally:
        conn.close()


@notifications_bp.route("/read-all", methods=["PATCH"])
@jwt_required
def read_all():
    conn = get_db()
    try:
        conn.execute(
            "UPDATE notifications SET is_read=1 WHERE user_id=?", (g.current_user["id"],)
        )
        conn.commit()
        return jsonify({"success": True})
    finally:
        conn.close()


@notifications_bp.route("/<int:notif_id>/read", methods=["PATCH"])
@jwt_required
def read_one(notif_id):
    conn = get_db()
    try:
        conn.execute(
            "UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?",
            (notif_id, g.current_user["id"])
        )
        conn.commit()
        return jsonify({"success": True})
    finally:
        conn.close()
