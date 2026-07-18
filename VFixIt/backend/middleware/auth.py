"""
VFixIt – JWT Authentication Middleware (Flask)
Provides decorators: @jwt_required, @role_required(*roles)
"""
import os
import jwt
from functools import wraps
from datetime import datetime, timedelta, timezone
from flask import request, jsonify, g
from db.database import get_db

JWT_SECRET = os.environ.get("JWT_SECRET", "vfixit_flask_jwt_secret_2026_cvr")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7


def generate_token(user_id: int, role: str) -> str:
    """Create a signed JWT that expires in JWT_EXPIRE_DAYS days."""
    payload = {
        "id":   user_id,
        "role": role,
        "exp":  datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
        "iat":  datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT; raise jwt exceptions on failure."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def jwt_required(f):
    """
    Decorator: validates the Bearer token in Authorization header.
    On success sets g.current_user = {id, name, email, role, city}.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"success": False, "message": "No token provided"}), 401
        token = auth[7:]
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401

        conn = get_db()
        row = conn.execute(
            "SELECT id, name, email, role, city FROM users WHERE id = ?",
            (payload["id"],)
        ).fetchone()
        conn.close()

        if not row:
            return jsonify({"success": False, "message": "User not found"}), 401

        g.current_user = dict(row)
        return f(*args, **kwargs)
    return decorated


def role_required(*roles):
    """
    Decorator factory: must be applied AFTER @jwt_required.
    Usage: @role_required('admin') or @role_required('user', 'provider')
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, "current_user"):
                return jsonify({"success": False, "message": "Not authenticated"}), 401
            if g.current_user["role"] not in roles:
                return jsonify({"success": False, "message": "Forbidden"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
