"use server";

import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  console.log("Attempting to send email to:", to);

  // 1. Check if we have credentials
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log("---------------------------------------------------");
    console.log("⚠️  EMAIL NOT SENT (Missing Credentials) ⚠️");
    console.log("To send real emails, create a .env.local file with:");
    console.log("EMAIL_USER=your-email@gmail.com");
    console.log("EMAIL_PASS=your-app-password");
    console.log("---------------------------------------------------");
    console.log("Simulating Email Content:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("---------------------------------------------------");
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, simulated: true };
  }

  // 2. Configure Transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use 'host' and 'port' for other providers
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    // 3. Send Email
    const info = await transporter.sendMail({
      from: `"Ticketing System" <${user}>`,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}
