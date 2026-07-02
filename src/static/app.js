document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const signupLockedMessage = document.getElementById("signup-locked-message");
  const messageDiv = document.getElementById("message");
  const authToggle = document.getElementById("auth-toggle");
  const authPanel = document.getElementById("auth-panel");
  const loginForm = document.getElementById("login-form");
  const authStatus = document.getElementById("auth-status");
  const authStatusText = document.getElementById("auth-status-text");
  const authMessage = document.getElementById("auth-message");
  const logoutButton = document.getElementById("logout-button");

  let isTeacherAuthenticated = false;

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function showAuthMessage(text, type) {
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
    authMessage.classList.remove("hidden");
  }

  function clearAuthMessage() {
    authMessage.textContent = "";
    authMessage.className = "auth-message hidden";
  }

  function updateTeacherControls() {
    signupForm.classList.toggle("hidden", !isTeacherAuthenticated);
    signupLockedMessage.classList.toggle("hidden", isTeacherAuthenticated);
    loginForm.classList.toggle("hidden", isTeacherAuthenticated);
    authStatus.classList.toggle("hidden", !isTeacherAuthenticated);
    authToggle.setAttribute("aria-expanded", String(!authPanel.classList.contains("hidden")));
  }

  async function fetchAuthStatus() {
    const response = await fetch("/auth/status");
    const result = await response.json();

    isTeacherAuthenticated = result.authenticated;
    authStatusText.textContent = result.authenticated
      ? `Logged in as ${result.username}`
      : "";

    if (!result.authenticated) {
      loginForm.reset();
    }

    updateTeacherControls();
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span>${
                        isTeacherAuthenticated
                          ? `<button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button>`
                          : ""
                      }</li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to unregister. Please try again.", "error");
      console.error("Error unregistering:", error);
    }
  }

  authToggle.addEventListener("click", () => {
    const isHidden = authPanel.classList.toggle("hidden");
    authToggle.setAttribute("aria-expanded", String(!isHidden));
    clearAuthMessage();
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearAuthMessage();

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: document.getElementById("username").value,
          password: document.getElementById("password").value,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showAuthMessage(result.detail || "Login failed", "error");
        return;
      }

      showAuthMessage(result.message, "success");
      await fetchAuthStatus();
      await fetchActivities();
    } catch (error) {
      showAuthMessage("Failed to log in. Please try again.", "error");
      console.error("Error logging in:", error);
    }
  });

  logoutButton.addEventListener("click", async () => {
    clearAuthMessage();

    try {
      const response = await fetch("/auth/logout", { method: "POST" });
      const result = await response.json();

      if (!response.ok) {
        showAuthMessage(result.detail || "Logout failed", "error");
        return;
      }

      showAuthMessage(result.message, "info");
      isTeacherAuthenticated = false;
      await fetchAuthStatus();
      await fetchActivities();
    } catch (error) {
      showAuthMessage("Failed to log out. Please try again.", "error");
      console.error("Error logging out:", error);
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchAuthStatus().then(fetchActivities);
});
