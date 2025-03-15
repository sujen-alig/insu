from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# Simulated OTP Storage (Use a database in production)
otp_storage = {}

@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    phone = data.get("phone")

    if phone:
        otp = str(random.randint(100000, 999999))  # Generate 6-digit OTP
        otp_storage[phone] = otp  # Store OTP temporarily
        return jsonify({"message": f"OTP {otp} sent to {phone}"}), 200

    return jsonify({"error": "Invalid request"}), 400

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    phone = data.get("phone")
    otp = data.get("otp")

    if otp_storage.get(phone) == otp:
        return jsonify({"message": "OTP verified successfully!"}), 200
    return jsonify({"error": "Invalid OTP or expired"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
