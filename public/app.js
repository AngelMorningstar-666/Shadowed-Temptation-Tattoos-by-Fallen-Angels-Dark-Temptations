const bookingForm = document.getElementById("booking-form");
const formStatus = document.getElementById("form-status");
const submitButton = document.getElementById("submit-button");

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);

  const bookingData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    style: formData.get("style"),
    idea: formData.get("idea")
  };

  formStatus.textContent = "Sending your booking request...";
  formStatus.style.color = "#caa35a";

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to send your request.");
    }

    formStatus.textContent = result.message;
    formStatus.style.color = "#8fd694";

    bookingForm.reset();
  } catch (error) {
    formStatus.textContent =
      error.message ||
      "Something went wrong. Please contact us directly by email.";

    formStatus.style.color = "#ff7575";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send Booking Request";
  }
});