require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const requiredEnv = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "BOOKING_EMAIL"
];

const missingEnv = requiredEnv.filter((name) => !process.env[name]);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Shadowed Temptation Tattoos booking API is running."
  });
});

app.post("/api/bookings", async (req, res) => {
  const { name, email, phone, style, idea } = req.body;

  if (!name || !email || !idea) {
    return res.status(400).json({
      success: false,
      message: "Please provide your name, email address, and tattoo idea."
    });
  }

  const cleanedName = String(name).trim();
  const cleanedEmail = String(email).trim();
  const cleanedPhone = String(phone || "Not provided").trim();
  const cleanedStyle = String(style || "Not selected").trim();
  const cleanedIdea = String(idea).trim();

  const simpleEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!simpleEmailPattern.test(cleanedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address."
    });
  }

  if (missingEnv.length > 0) {
    console.error("Missing environment variables:", missingEnv.join(", "));

    return res.status(500).json({
      success: false,
      message: "The booking system is not configured yet. Please contact us directly."
    });
  }

  const submittedAt = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short"
  });

  const textMessage = `
New tattoo booking request

Name: ${cleanedName}
Email: ${cleanedEmail}
Phone: ${cleanedPhone}
Tattoo style: ${cleanedStyle}

Tattoo idea:
${cleanedIdea}

Submitted: ${submittedAt}
`;

  try {
    await transporter.sendMail({
      from: `"Shadowed Temptation Website" <${process.env.EMAIL_USER}>`,
      to: process.env.BOOKING_EMAIL,
      replyTo: cleanedEmail,
      subject: `New Booking Request: ${cleanedName}`,
      text: textMessage
    });

    return res.status(201).json({
      success: true,
      message: "Your booking request has been sent. We will contact you soon."
    });
  } catch (error) {
    console.error("Email sending error:", error);

    return res.status(500).json({
      success: false,
      message: "We could not send your request right now. Please try again later."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});