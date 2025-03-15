function sendOTP() {
    let phone = document.getElementById("phone").value;
    
    fetch("http://localhost/otp-backend/send_otp.php", {  // If using PHP
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `phone=${phone}`
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Error:", error));
}

