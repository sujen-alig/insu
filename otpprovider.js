document.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.getElementById("phone");
    const otpInput = document.getElementById("otp");
    const sendOtpButton = document.getElementById("sendOtp");
    const verifyOtpButton = document.getElementById("verifyOtp");
    const countdownDisplay = document.getElementById("countdown");
    let countdownInterval;

    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    }

    function startCountdown(seconds) {
        let remainingTime = seconds;
        countdownDisplay.textContent = `OTP expires in ${remainingTime}s`;
        countdownInterval = setInterval(() => {
            remainingTime--;
            countdownDisplay.textContent = `OTP expires in ${remainingTime}s`;
            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                countdownDisplay.textContent = "OTP expired. Please request a new one.";
            }
        }, 1000);
    }

    sendOtpButton.addEventListener("click", function () {
        const phoneNumber = phoneInput.value.trim();
        if (!phoneNumber) {
            alert("Please enter a valid phone number");
            return;
        }
        
        const otp = generateOTP();
        otpInput.value = otp; // Display OTP (For testing, remove in production)
        sendOtpButton.disabled = true;
        setTimeout(() => sendOtpButton.disabled = false, 30000); // Disable resend for 30 seconds

        fetch("http://localhost:5000/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phoneNumber, otp: otp })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            startCountdown(300); // Start 5-minute countdown
        })
        .catch(error => console.error("Error sending OTP:", error));
    });

    verifyOtpButton.addEventListener("click", function () {
        const phoneNumber = phoneInput.value.trim();
        const otpValue = otpInput.value.trim();
        if (!phoneNumber || !otpValue) {
            alert("Please enter your phone number and OTP");
            return;
        }

        fetch("http://localhost:5000/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phoneNumber, otp: otpValue })
        })
        .then(response => response.json())
        .then(data => alert(data.message || data.error))
        .catch(error => console.error("Error verifying OTP:", error));
    });
});