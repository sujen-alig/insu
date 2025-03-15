# backend/app.py
from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def init_db():
    conn = sqlite3.connect('bets.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        full_name TEXT,
                        mobile TEXT,
                        email TEXT,
                        dob TEXT,
                        username TEXT UNIQUE,
                        password TEXT,
                        photo TEXT,
                        pan TEXT,
                        aadhar TEXT)''')
    conn.commit()
    conn.close()

@app.route('/register', methods=['POST'])
def register():
    full_name = request.form['full_name']
    mobile = request.form['mobile']
    email = request.form['email']
    dob = request.form['dob']
    username = request.form['username']
    password = request.form['password']
    
    photo = request.files['photo']
    pan = request.files['pan']
    aadhar = request.files['aadhar']
    
    photo_path = os.path.join(app.config['UPLOAD_FOLDER'], photo.filename)
    pan_path = os.path.join(app.config['UPLOAD_FOLDER'], pan.filename)
    aadhar_path = os.path.join(app.config['UPLOAD_FOLDER'], aadhar.filename)
    
    photo.save(photo_path)
    pan.save(pan_path)
    aadhar.save(aadhar_path)
    
    conn = sqlite3.connect('bets.db')
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (full_name, mobile, email, dob, username, password, photo, pan, aadhar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (full_name, mobile, email, dob, username, password, photo_path, pan_path, aadhar_path))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 400
    finally:
        conn.close()
    
    return jsonify({"message": "Registration successful!"})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
