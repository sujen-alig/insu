document.getElementById("registrationForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("full_name", document.getElementById("full_name").value);
    formData.append("mobile", document.getElementById("mobile").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("dob", document.getElementById("dob").value);
    formData.append("username", document.getElementById("username").value);
    formData.append("password", document.getElementById("password").value);
    formData.append("photo", document.getElementById("photo").files[0]);
    formData.append("pan", document.getElementById("pan").files[0]);
    formData.append("aadhar", document.getElementById("aadhar").files[0]);

    const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    document.getElementById("message").textContent = result.message || result.error;
});
