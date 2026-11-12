document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  // User must be logged in
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const requestList = document.getElementById("requestList");
  const requestForm = document.getElementById("requestForm");

  // Display messages
  function showAlert(message, type = "error") {
    const alertBox = document.getElementById("formAlert");

    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = `form-alert ${type}`;
    alertBox.style.display = "block";
  }

  function clearAlert() {
    const alertBox = document.getElementById("formAlert");

    if (alertBox) {
      alertBox.textContent = "";
      alertBox.style.display = "none";
    }
  }

  // Handle expired or invalid login sessions
  function handleError(error) {
    if (
      error.message.includes("Session expired") ||
      error.message.includes("Please log in") ||
      error.message.includes("Account no longer exists")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
      return;
    }

    console.error(error);
  }

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  // Format date
  function formatDate(dateValue) {
    if (!dateValue) return "Not specified";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return "Not specified";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  // Update dashboard statistics
  function updateStats(requests) {
    const total = requests.length;

    const pending = requests.filter(
      request => request.status === "pending"
    ).length;

    const approved = requests.filter(
      request => request.status === "approved"
    ).length;

    const done = requests.filter(request =>
      ["collected", "recycled"].includes(request.status)
    ).length;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statPending").textContent = pending;
    document.getElementById("statApproved").textContent = approved;
    document.getElementById("statDone").textContent = done;
  }

  // Display requests safely
  function displayRequests(requests) {
    requestList.replaceChildren();

    if (!requests.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "You haven't submitted any pickup requests yet.";

      requestList.appendChild(empty);
      return;
    }

    requests.forEach(request => {
      const card = document.createElement("div");
      card.className = "request-card";

      const title = document.createElement("h3");
      title.textContent = request.itemName || "E-waste item";

      const category = document.createElement("p");
      category.textContent = `Category: ${request.category}`;

      const quantity = document.createElement("p");
      quantity.textContent = `Quantity: ${request.quantity}`;

      const condition = document.createElement("p");
      condition.textContent = `Condition: ${request.condition}`;

      const pickup = document.createElement("p");
      pickup.textContent = `Pickup date: ${formatDate(request.pickupDate)}`;

      const status = document.createElement("span");
      status.className = "request-status";
     const statusText = {
  pending: "Pending",
  approved: "Approved",
  collected: "Collected",
  recycled: "Recycled",
  rejected: "Rejected"
};

status.textContent =
  `Status: ${statusText[request.status] || "Unknown"}`;

status.classList.add(`status-${request.status}`);

      card.append(title, category, quantity, condition, pickup, status);

      // Show uploaded image if available
      if (request.image) {
        const image = document.createElement("img");
        image.src = `/uploads/${encodeURIComponent(request.image)}`;
        image.alt = "Uploaded e-waste";
        image.className = "request-image";
        image.style.maxWidth = "150px";
        image.style.display = "block";
        image.style.marginTop = "10px";

        card.appendChild(image);
      }

      // Cancel only pending requests
      if (request.status === "pending") {
        const cancelButton = document.createElement("button");

        cancelButton.type = "button";
        cancelButton.textContent = "Cancel request";
        cancelButton.className = "btn btn-outline";

        cancelButton.addEventListener("click", async () => {
          const confirmed = window.confirm(
            "Are you sure you want to cancel this request?"
          );

          if (!confirmed) return;

          try {
            await window.apiRequest(`/requests/${request._id}`, {
              method: "DELETE"
            });

            await loadRequests();

          } catch (error) {
            alert(error.message);
            handleError(error);
          }
        });

        card.appendChild(cancelButton);
      }

      requestList.appendChild(card);
    });
  }

  // Load user's requests
  async function loadRequests() {
    try {
      const result = await window.apiRequest("/requests/my");

      const requests = result.requests || [];

      updateStats(requests);
      displayRequests(requests);

    } catch (error) {
      requestList.textContent = error.message;
      handleError(error);
    }
  }

  // Verify user and load dashboard
  try {
    const result = await window.apiRequest("/auth/me");

    const user = result.user;

    document.getElementById("userName").textContent = user.name;
    document.getElementById("welcomeName").textContent = user.name;

    localStorage.setItem("user", JSON.stringify(user));

    await loadRequests();

  } catch (error) {
    console.error("Authentication error:", error);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
    return;
  }

  // Submit a new pickup request
  requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlert();

    const category = document.getElementById("category").value;
    const itemName = document.getElementById("itemName").value.trim();
    const quantity = document.getElementById("quantity").value;
    const condition = document.getElementById("condition").value;
    const address = document.getElementById("address").value.trim();
    const pickupDate = document.getElementById("pickupDate").value;
    const image = document.getElementById("image").files[0];

    if (!category || !itemName || !quantity || !condition || !address || !pickupDate) {
      showAlert("Please fill in all required fields.");
      return;
    }

    if (itemName.length < 2) {
      showAlert("Item name must contain at least 2 characters.");
      return;
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 1000) {
      showAlert("Enter a valid quantity between 1 and 1000.");
      return;
    }

    if (address.length < 10) {
      showAlert("Please enter a complete pickup address.");
      return;
    }

    const selectedDate = new Date(`${pickupDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      showAlert("Please choose today or a future pickup date.");
      return;
    }

    if (image) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(image.type)) {
        showAlert("Only JPG, PNG and WEBP images are allowed.");
        return;
      }

      if (image.size > 5 * 1024 * 1024) {
        showAlert("Image size must be 5 MB or smaller.");
        return;
      }
    }

    // FormData is required for image uploads
    const formData = new FormData();

    formData.append("category", category);
    formData.append("itemName", itemName);
    formData.append("quantity", quantity);
    formData.append("condition", condition);
    formData.append("description",
      document.getElementById("description").value.trim()
    );
    formData.append("address", address);
    formData.append("pickupDate", pickupDate);

    if (image) {
      formData.append("image", image);
    }

    const submitButton = requestForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      const result = await window.apiRequest("/requests", {
        method: "POST",
        body: formData
      });

      showAlert(
        result.message || "Pickup request submitted successfully!",
        "success"
      );

      requestForm.reset();

      await loadRequests();

    } catch (error) {
      showAlert(error.message);
      handleError(error);

    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit request";
    }
  });

});