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
        otp_storage[phone] = otp  # Store OTP temporarily (Use DB in production)
        return jsonify({"message": f"OTP {otp} sent to {phone}"}), 200

    return jsonify({"error": "Invalid request"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
