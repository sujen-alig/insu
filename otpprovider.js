document.addEventListener("DOMContentLoaded", function () {
    const backendUrl = "https://your-backend-url.com"; // Replace with your Flask backend URL

    document.getElementById("sendOtp").addEventListener("click", function () {
        const phone = document.getElementById("phone").value;

        fetch(`${backendUrl}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("response").innerText = data.message || data.error;
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("response").innerText = "Error sending OTP";
        });
    });

    document.getElementById("verifyOtp").addEventListener("click", function () {
        const phone = document.getElementById("phone").value;
        const otp = document.getElementById("otp").value;

        fetch(`${backendUrl}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone, otp: otp })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("response").innerText = data.message || data.error;
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("response").innerText = "Error verifying OTP";
        });
    });
});
