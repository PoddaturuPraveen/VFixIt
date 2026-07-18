"""
VFixIt - Flask Application Entry Point
Run: python app.py
"""
import os
import sys
import sqlite3
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

# ── path setup so sub-packages import cleanly ─────────────────
sys.path.insert(0, os.path.dirname(__file__))

# ── Database initialisation ───────────────────────────────────
from db.database import init_db, seed_db
init_db()
seed_db()

# ── Flask app ─────────────────────────────────────────────────
app = Flask(__name__, static_folder=None)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Register blueprints ───────────────────────────────────────
from routes.auth          import auth_bp
from routes.providers     import providers_bp
from routes.bookings      import bookings_bp
from routes.reviews       import reviews_bp
from routes.notifications import notifications_bp
from routes.admin         import admin_bp

app.register_blueprint(auth_bp,          url_prefix="/api/auth")
app.register_blueprint(providers_bp,     url_prefix="/api/providers")
app.register_blueprint(bookings_bp,      url_prefix="/api/bookings")
app.register_blueprint(reviews_bp,       url_prefix="/api/reviews")
app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
app.register_blueprint(admin_bp,         url_prefix="/api/admin")

# ── Health check ──────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"ok": True, "framework": "Flask", "version": "1.0.0"})

# ── Serve frontend static files ───────────────────────────────
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # API routes are handled above — this only catches non-API paths
    full = os.path.join(FRONTEND_DIR, path)
    if path and os.path.isfile(full):
        return send_from_directory(FRONTEND_DIR, path)
    # SPA fallback — always return index.html
    return send_from_directory(FRONTEND_DIR, "index.html")

# ── Error handlers ────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "message": "Endpoint not found"}), 404

@app.errorhandler(sqlite3.IntegrityError)
def handle_integrity_error(e):
    """Catch database unique constraint violations and return friendly messages."""
    err_msg = str(e).lower()
    if "unique constraint failed" in err_msg and "users.email" in err_msg:
        return jsonify({
            "success": False, 
            "message": "This email address is already registered. Please use a different email or sign in."
        }), 409
    return jsonify({"success": False, "message": "A database integrity error occurred."}), 400

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"success": False, "message": "Method not allowed"}), 405

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"success": False, "message": "Internal server error"}), 500

# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 5000))
    print(f"\n🔧  VFixIt (Flask) running → http://localhost:{PORT}\n")
    print(f"    Admin    : admin@vfixit.in  / admin123")
    print(f"    User     : priya@gmail.com  / user123")
    print(f"    Provider : ravi@pro.com     / prov123\n")
    app.run(host="0.0.0.0", port=PORT, debug=False)
