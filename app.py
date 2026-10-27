import os

from flask import (Flask, jsonify, redirect, render_template, request,
                   send_from_directory, url_for)

from analysis import analyze_situation
from errors import ApiError, error_body, register_error_handlers
from validation import parse_request

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 256 * 1024   # reject bodies over 256 KB with a JSON 413
register_error_handlers(app)


@app.route('/')
def index():
   print('Request for index page received')
   return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/hello', methods=['POST'])
def hello():
   name = request.form.get('name')

   if name:
       print('Request for hello page received with name=%s' % name)
       return render_template('hello.html', name = name)
   else:
       print('Request for hello page received with no name or blank name -- redirecting')
       return redirect(url_for('index'))

@app.get("/api/health")
def health():
    return jsonify(ok=True)
 
@app.post("/api/analyze")
def analyze():
    if not request.is_json:
        raise ApiError(415, "unsupported_media_type", "Content-Type must be application/json")
    payload = request.get_json(silent=True)      # None when the body is not valid JSON
    if payload is None:
        raise ApiError(400, "invalid_json", "Request body is not valid JSON")
 
    req = parse_request(payload)                 # raises ApiError(422) with field-level details
    result = analyze_situation(req)
    return jsonify(result.model_dump(mode="json"))


if __name__ == '__main__':
   app.run()
