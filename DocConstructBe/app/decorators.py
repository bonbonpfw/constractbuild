from functools import wraps
import jwt

from flask import request, jsonify
from database.database import db_session
from config.sys_config import SECRET_KEY


def jwt_required(f):
    """API endpoint decorator to enforce JWT authentication."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None

        # Check for token in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({
                    "error_code": "unauthorized",
                    "error_message": "Invalid authorization header",
                    "status_code": "error_code",
                }), 401

        if not token:
            return jsonify({
                "error_code": "unauthorized",
                "error_message": "לא מורשה",
                "status_code": "error_code",
            }), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.user_id = data['user_id']
            request.user_role = data.get('role', 'user')
        except jwt.ExpiredSignatureError:
            return jsonify({
                "error_code": "unauthorized",
                "error_message": "Token has expired",
                "status_code": "error_code",
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "error_code": "unauthorized",
                "error_message": "Invalid token",
                "status_code": "error_code",
            }), 401

        return f(*args, **kwargs)

    return decorated_function


def admin_required(f):
    """API endpoint decorator to enforce admin role. Must be used after @jwt_required."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if getattr(request, 'user_role', 'user') != 'admin':
            return jsonify({
                "error_code": "forbidden",
                "error_message": "אין הרשאה",
                "status_code": "error_code",
            }), 403
        return f(*args, **kwargs)

    return decorated_function


def auto_rollback(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            db_session.rollback()
            print(f"Rolled back session due to: {e}")
            raise
    return decorated