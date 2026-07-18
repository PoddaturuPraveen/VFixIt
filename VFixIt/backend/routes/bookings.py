"""
VFixIt – Bookings Routes
POST   /api/bookings              – create booking (user / provider / admin)
GET    /api/bookings/my           – list my bookings (user / provider / admin)
GET    /api/bookings/<id>         – booking detail
PATCH  /api/bookings/<id>/status  – update status
"""
from flask import Blueprint, request, jsonify, g
from db.database import get_db, notify

from middleware.auth import jwt_required, role_required

bookings_bp = Blueprint("bookings", __name__)


# ── Create booking ────────────────────────────────────────────
# Any authenticated role (user / provider / admin) can book a service.
@bookings_bp.route("/", methods=["POST"])
@jwt_required
def create_booking():
    data           = request.get_json(silent=True) or {}
    provider_id    = data.get("provider_id")
    booking_date   = (data.get("booking_date") or "").strip()
    time_slot      = (data.get("time_slot")    or "").strip()
    address        = (data.get("address")      or "").strip()
    city           = (data.get("city")         or "").strip()
    service_id     = data.get("service_id")
    notes          = (data.get("notes")        or "").strip()
    payment_method = (data.get("payment_method") or "cash").strip()
    total_amount   = data.get("total_amount")

    if not all([provider_id, booking_date, time_slot, address, city]):
        return jsonify({"success": False,
                        "message": "provider_id, booking_date, time_slot, address and city are required"}), 400

    conn = get_db()
    try:
        prov = conn.execute(
            "SELECT * FROM providers WHERE id=? AND verified=1 AND available=1",
            (int(provider_id),)
        ).fetchone()
        if not prov:
            return jsonify({"success": False, "message": "Provider not found or unavailable"}), 404

        # Self-booking prevention – a provider cannot book themselves
        if g.current_user["role"] == "provider":
            own = conn.execute(
                "SELECT id FROM providers WHERE user_id=?", (g.current_user["id"],)
            ).fetchone()
            if own and own["id"] == int(provider_id):
                return jsonify({"success": False, "message": "You cannot book your own services."}), 400

        # Slot conflict check
        clash = conn.execute(
            "SELECT id FROM bookings WHERE provider_id=? AND booking_date=? AND time_slot=? "
            "AND status NOT IN ('cancelled','rejected')",
            (int(provider_id), booking_date, time_slot)
        ).fetchone()
        if clash:
            return jsonify({"success": False, "message": "That time slot is already booked"}), 409

        amount = float(total_amount) if total_amount is not None else prov["price_per_hour"]
        cur = conn.execute(
            "INSERT INTO bookings"
            "(user_id,provider_id,service_id,booking_date,time_slot,address,city,notes,payment_method,total_amount)"
            " VALUES(?,?,?,?,?,?,?,?,?,?)",
            (g.current_user["id"], int(provider_id),
             int(service_id) if service_id else None,
             booking_date, time_slot, address, city, notes, payment_method, amount)
        )
        booking_id = cur.lastrowid
        conn.commit()

        # Notifications
        prov_user = conn.execute(
            "SELECT user_id FROM providers WHERE id=?", (int(provider_id),)
        ).fetchone()
        notify(prov_user["user_id"], "New Booking Request 📋",
               f"New booking on {booking_date} at {time_slot}", "booking")
        notify(g.current_user["id"], "Booking Submitted ✅",
               f"Your booking for {booking_date} is pending confirmation.", "booking")

        booking = dict(conn.execute(
            "SELECT * FROM bookings WHERE id=?", (booking_id,)
        ).fetchone())
        return jsonify({"success": True, "message": "Booking created", "data": booking}), 201
    finally:
        conn.close()


# ── My bookings ───────────────────────────────────────────────
@bookings_bp.route("/my", methods=["GET"])
@jwt_required
def my_bookings():
    conn = get_db()
    try:
        role = g.current_user["role"]
        uid  = g.current_user["id"]

        if role == "user":
            rows = conn.execute(
                "SELECT b.*, u.name AS provider_name, u.phone AS provider_phone, "
                "p.category, p.price_per_hour, p.rating AS provider_rating "
                "FROM bookings b "
                "JOIN providers p ON p.id=b.provider_id "
                "JOIN users u ON u.id=p.user_id "
                "WHERE b.user_id=? ORDER BY b.created_at DESC",
                (uid,)
            ).fetchall()
        elif role == "provider":
            p = conn.execute(
                "SELECT id FROM providers WHERE user_id=?", (uid,)
            ).fetchone()
            if not p:
                return jsonify({"success": True, "data": []})
            rows = conn.execute(
                "SELECT b.*, u.name AS user_name, u.phone AS user_phone "
                "FROM bookings b JOIN users u ON u.id=b.user_id "
                "WHERE b.provider_id=? ORDER BY b.created_at DESC",
                (p["id"],)
            ).fetchall()
        else:
            # admin (and any future role) sees ALL their own bookings as a customer
            rows = conn.execute(
                "SELECT b.*, u.name AS provider_name, u.phone AS provider_phone, "
                "p.category, p.price_per_hour, p.rating AS provider_rating "
                "FROM bookings b "
                "JOIN providers p ON p.id=b.provider_id "
                "JOIN users u ON u.id=p.user_id "
                "WHERE b.user_id=? ORDER BY b.created_at DESC",
                (uid,)
            ).fetchall()

        return jsonify({"success": True, "data": [dict(r) for r in rows]})
    finally:
        conn.close()


# ── Booking detail ────────────────────────────────────────────
@bookings_bp.route("/<int:booking_id>", methods=["GET"])
@jwt_required
def booking_detail(booking_id):
    conn = get_db()
    try:
        b = conn.execute(
            "SELECT b.*, "
            "cu.name AS user_name, cu.phone AS user_phone, "
            "pu.name AS provider_name, pu.phone AS provider_phone, "
            "p.category, p.rating AS provider_rating, p.price_per_hour "
            "FROM bookings b "
            "JOIN users cu ON cu.id=b.user_id "
            "JOIN providers p ON p.id=b.provider_id "
            "JOIN users pu ON pu.id=p.user_id "
            "WHERE b.id=?",
            (booking_id,)
        ).fetchone()
        if not b:
            return jsonify({"success": False, "message": "Booking not found"}), 404

        b = dict(b)
        role = g.current_user["role"]
        uid  = g.current_user["id"]
        if role == "user" and b["user_id"] != uid:
            return jsonify({"success": False, "message": "Forbidden"}), 403

        return jsonify({"success": True, "data": b})
    finally:
        conn.close()


# ── Update booking status ─────────────────────────────────────
@bookings_bp.route("/<int:booking_id>/status", methods=["PATCH"])
@jwt_required
def update_status(booking_id):
    data   = request.get_json(silent=True) or {}
    status = (data.get("status") or "").strip()
    role   = g.current_user["role"]
    uid    = g.current_user["id"]

    allowed = {
        "provider": ["confirmed", "rejected", "completed"],
        "user":     ["cancelled"],
        "admin":    ["confirmed", "rejected", "completed", "cancelled"],
    }
    if status not in allowed.get(role, []):
        return jsonify({"success": False,
                        "message": f"Role '{role}' cannot set status '{status}'"}), 400

    conn = get_db()
    try:
        b = conn.execute(
            "SELECT * FROM bookings WHERE id=?", (booking_id,)
        ).fetchone()
        if not b:
            return jsonify({"success": False, "message": "Booking not found"}), 404
        b = dict(b)

        # Authorisation
        if role == "provider":
            p = conn.execute(
                "SELECT id FROM providers WHERE user_id=?", (uid,)
            ).fetchone()
            if not p or b["provider_id"] != p["id"]:
                return jsonify({"success": False, "message": "Forbidden"}), 403
        if role == "user" and b["user_id"] != uid:
            return jsonify({"success": False, "message": "Forbidden"}), 403

        conn.execute("UPDATE bookings SET status=? WHERE id=?", (status, booking_id))

        if status == "completed":
            from datetime import datetime
            today = datetime.now().strftime("%Y-%m-%d")
            if b["booking_date"] > today:
                return jsonify({"success": False, "message": "Cannot complete booking before the scheduled date."}), 400

            if role == "provider" and b["user_work_status"] != "done":
                return jsonify({"success": False, "message": "User must mark the work as Done first."}), 400

            conn.execute(
                "UPDATE providers SET total_earnings=total_earnings+? WHERE id=?",
                (b["total_amount"], b["provider_id"])
            )

        conn.commit()

        msgs = {
            "confirmed": ("Booking Confirmed! 🎉",
                          f"Your booking on {b['booking_date']} is confirmed."),
            "rejected":  ("Booking Rejected",
                          f"Your booking on {b['booking_date']} was rejected."),
            "completed": ("Service Completed ✅",
                          f"Service on {b['booking_date']} is complete. Please leave a review!"),
            "cancelled": ("Booking Cancelled",
                          f"Booking on {b['booking_date']} has been cancelled."),
        }
        title, msg = msgs.get(status, ("Booking Update", "Your booking status was updated."))
        notify(b["user_id"], title, msg, "booking")

        updated = dict(conn.execute(
            "SELECT * FROM bookings WHERE id=?", (booking_id,)
        ).fetchone())
        return jsonify({"success": True, "message": f"Booking {status}", "data": updated})
    finally:
        conn.close()

# ── Update user work status ───────────────────────────────────
# The booking owner (any role) can mark the work as done/not-done.
@bookings_bp.route("/<int:booking_id>/user-status", methods=["PATCH"])
@jwt_required
def update_user_status(booking_id):
    data   = request.get_json(silent=True) or {}
    status = (data.get("status") or "").strip()
    uid    = g.current_user["id"]

    if status not in ["done", "not_done"]:
        return jsonify({"success": False, "message": "Invalid status"}), 400

    conn = get_db()
    try:
        b = conn.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone()
        if not b:
            return jsonify({"success": False, "message": "Booking not found"}), 404
        if b["user_id"] != uid:
            return jsonify({"success": False, "message": "Forbidden"}), 403
        if b["status"] != "confirmed":
            return jsonify({"success": False, "message": "Booking must be confirmed first"}), 400
            
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        if status == "done" and b["booking_date"] > today:
            return jsonify({"success": False, "message": "Cannot mark work as done before the scheduled date."}), 400

        conn.execute("UPDATE bookings SET user_work_status=? WHERE id=?", (status, booking_id))
        conn.commit()

        # Notify provider
        prov = conn.execute("SELECT user_id FROM providers WHERE id=?", (b["provider_id"],)).fetchone()
        if prov:
            if status == "done":
                notify(prov["user_id"], "Work Marked as Done ✅", "The user confirmed the work is complete. You can now finalize the booking.", "booking")
            else:
                notify(prov["user_id"], "Work Marked as Not Done ❌", "The user reported the work is not complete. Please follow up.", "booking")

        return jsonify({"success": True, "message": f"Work status updated to {status}"})
    finally:
        conn.close()
