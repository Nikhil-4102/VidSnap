from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from summary import process_video_from_url, genrate_thumbnail, SummaryGenrationError
import requests
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from io import BytesIO

app = Flask(__name__)
CORS(app)

# MongoDB Setup
client = MongoClient("mongodb+srv://nikhilmalave4102:sUs0qZNYzmLTHk4w@cluster0.rs2idww.mongodb.net/")
db = client['video_summary_db']
users_collection = db['users']

# Directory Setup
UPLOAD_FOLDER = 'uploads'
THUMBNAIL_FOLDER = os.path.expanduser('~/Dataset_YT/backend/Downloads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(THUMBNAIL_FOLDER, exist_ok=True)

app.config.update(
    UPLOAD_FOLDER=UPLOAD_FOLDER,
    THUMBNAIL_FOLDER=THUMBNAIL_FOLDER,
    MAX_CONTENT_LENGTH=16 * 1024 * 1024  # 16MB
)

def get_youtube_thumbnail(video_id):
    """Returns the best available YouTube thumbnail URL for a video ID."""
    resolutions = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default']
    for res in resolutions:
        url = f'https://img.youtube.com/vi/{video_id}/{res}.jpg'
        if requests.get(url).status_code == 200:
            return url
    return None

@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.get_json()
        video_url = data.get('video_url')

        if not video_url:
            return jsonify({"error": "Missing video URL"}), 400

        summary = process_video_from_url(video_url)
        if not summary:
            raise SummaryGenrationError

        return jsonify({'summary': summary})
    except Exception as e:
        print(f"/summarize error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/get_current_thumbnail', methods=['POST'])
def get_current_thumbnail():
    try:
        data = request.get_json()
        video_id = data.get('video_id')

        if not video_id:
            return jsonify({"error": "Missing video ID"}), 400

        thumbnail_url = get_youtube_thumbnail(video_id)
        if not thumbnail_url:
            return jsonify({"error": "Could not fetch thumbnail"}), 404

        return jsonify({'thumbnail_url': thumbnail_url})
    except Exception as e:
        print(f"/get_current_thumbnail error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_thumbnails', methods=['POST'])
def generate_thumbnails():
    try:
        data = request.get_json()
        summary = data.get('summary')
        video_url = data.get('video_url')
        include_human = data.get("includeHuman", True)
        include_text = data.get("includeText", True)

        if not summary or not video_url:
            return jsonify({"error": "Missing required parameters"}), 400

        image_name = genrate_thumbnail(summary, include_human, include_text)
        path = f"http://127.0.0.1:5000/thumbnails/{image_name}"

        return jsonify({'thumbnails': [path]})
    except Exception as e:
        print(f"/generate_thumbnails error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/thumbnails/<filename>')
def serve_thumbnail(filename):
    try:
        path = os.path.join(app.config['THUMBNAIL_FOLDER'], filename)
        if os.path.exists(path):
            return send_file(path)
        return jsonify({"error": "Thumbnail not found"}), 404
    except Exception as e:
        print(f"/thumbnails error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name, email, password = data.get('name'), data.get('email'), data.get('password')

        if not all([name, email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        if users_collection.find_one({'email': email}):
            return jsonify({"error": "User already exists"}), 400

        hashed_password = generate_password_hash(password)
        users_collection.insert_one({'name': name, 'email': email, 'password': hashed_password})

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"/register error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email, password = data.get('email'), data.get('password')

        if not all([email, password]):
            return jsonify({"error": "Missing email or password"}), 400

        user = users_collection.find_one({'email': email})
        if not user or not check_password_hash(user['password'], password):
            return jsonify({"error": "Invalid credentials"}), 401

        return jsonify({"message": "Login successful", "token": "dummy-token"}), 200
    except Exception as e:
        print(f"/login error: {e}")
        return jsonify({"error": str(e)}), 500

# Error Handlers
@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "File size exceeded (16MB)"}), 413

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
