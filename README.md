<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Free OTP Sender</title>
    <link rel="stylesheet" href="styles.css">
    <src="otpprovider.js></src>
        

        function generateOTP() {
            let phoneInput = document.getElementById("phone");
            let otpInput = document.getElementById("otp");
            let phoneNumber = phoneInput.value || "+919876543210"; // Default or user-input number
            let otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
            otpInput.value = otp;
            
            fetch("/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: phoneNumber, otp: otp })
            })
            .then(response => response.json())
            .then(data => alert(data.message));
        }
    </script>
    <p id="countdown"></p>

</head>
<body>
    <div class="container">
        <h2>Free OTP Sender</h2>
        <input type="text" id="phone" placeholder="Enter phone number">
        <input type="text" id="otp" placeholder="Generated OTP" readonly>
        <button onclick="generateOTP()">Send OTP</button>
    </div>
</body>
</html>

