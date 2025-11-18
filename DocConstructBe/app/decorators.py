from functools import wraps
import jwt

from flask import request, jsonify

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
