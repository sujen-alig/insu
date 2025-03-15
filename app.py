from flask import Flask, request, jsonify
import random, time, requests

app = Flask(__name__)
OTP_STORE = {}
PHONE_IP = "http://192.168.1.100:8080"  # Replace with your phone's IP
OTP_EXPIRY = 300  # 5 minutes in seconds
API_KEY = "e50379eb26e492f52b0b385e8438e9719fc214d922ec3cde"
PHONE_NUMBER = "9162937580"

def send_sms(phone_number, otp):
    sms_url = f"{PHONE_IP}/sendsms"
    data = {
        "api_key": API_KEY,
        "number": phone_number,
        "message": f"Your OTP is {otp}. It expires in 5 minutes."
    }
    response = requests.post(sms_url, json=data)
    return response.json()

@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    phone = data.get("phone")
    otp = data.get("otp", str(random.randint(100000, 999999)))  # Generate OTP if not provided
    OTP_STORE[phone] = {"otp": otp, "timestamp": time.time()}
    response = send_sms(phone, otp)
    return jsonify({"message": "OTP sent successfully!", "response": response})

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    phone = data.get("phone")
    otp = data.get("otp")
    if phone in OTP_STORE:
        stored_otp = OTP_STORE[phone]
        if time.time() - stored_otp["timestamp"] <= OTP_EXPIRY and stored_otp["otp"] == otp:
            return jsonify({"message": "OTP verified successfully!"})
        else:
            return jsonify({"error": "OTP expired or incorrect"}), 400
    return jsonify({"error": "No OTP found for this number"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
