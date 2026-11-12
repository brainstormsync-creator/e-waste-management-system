document.addEventListener("DOMContentLoaded", () => {

  // Display success or error messages
  function showAlert(message, type = "error") {
    const alertBox = document.getElementById("formAlert");

    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.style.display = "block";
    alertBox.className = `form-alert ${type}`;
  }

  // LOGIN
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        showAlert("Please enter your email and password.");
        return;
      }

      try {
        const result = await window.apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });

        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        showAlert("Login successful! Redirecting...", "success");

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);

      } catch (error) {
        showAlert(error.message);
      }
    });
  }

  // REGISTER
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword =
        document.getElementById("confirmPassword").value;

      if (!name || !email || !password || !confirmPassword) {
        showAlert("Please fill in all required fields.");
        return;
      }

      if (name.length < 3) {
        showAlert("Name must contain at least 3 characters.");
        return;
      }

      if (password.length < 6) {
        showAlert("Password must contain at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        showAlert("Passwords do not match.");
        return;
      }

      try {
        const result = await window.apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            phone,
            password
          })
        });

        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        showAlert("Account created successfully! Redirecting...", "success");

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);

      } catch (error) {
        showAlert(error.message);
      }
    });
  }

});