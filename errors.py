"""One consistent JSON error shape for the whole API.

    {"error": {"code": "...", "message": "...", "details": [...], "request_id": "..."}}

`details` is only present for validation problems, `request_id` only for 500s
(it is also written to the server log, so you can find the stack trace).
"""
import uuid

from typing import Optional

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    """An error we raise on purpose; it is safe to show to the client."""

    def __init__(self, status: int, code: str, message: str, details: Optional[list[dict]] = None):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.details = details


def error_body(code: str, message: str, details=None, request_id: Optional[str] = None) -> dict:
    body: dict = {"code": code, "message": message}
    if details:
        body["details"] = details
    if request_id:
        body["request_id"] = request_id
    return {"error": body}


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(exc: ApiError):
        return jsonify(error_body(exc.code, exc.message, exc.details)), exc.status

    @app.errorhandler(HTTPException)
    def handle_http_error(exc: HTTPException):
        # 404, 405, 413 (body too large) ... as JSON instead of Flask's HTML pages
        code = (exc.name or "http_error").lower().replace(" ", "_")
        return jsonify(error_body(code, exc.description or exc.name)), exc.code or 500

    @app.errorhandler(Exception)
    def handle_unexpected(exc: Exception):
        # Never leak internals. Log the stack trace, give the client an id to quote.
        request_id = uuid.uuid4().hex[:12]
        app.logger.exception("Unhandled error (request_id=%s)", request_id)
        return jsonify(error_body("internal_error", "Unexpected server error", request_id=request_id)), 500