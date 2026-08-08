const nodemailer = require("nodemailer");

// Uses Gmail SMTP — free, no credit card needed.
// Set GMAIL_USER and GMAIL_APP_PASSWORD in .env
// Gmail App Password: myaccount.google.com → Security → 2-Step Verification → App Passwords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendOutfitSharedEmail({ toEmail, toName, fromName, outfitName, appUrl, message }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Email not configured — skipping notification.");
    return;
  }

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2eaff">
      <div style="background:#2166f0;padding:28px 32px">
        <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">Sortech Wardrobe</span>
      </div>
      <div style="padding:32px">
        <p style="font-size:16px;color:#1e293b;margin:0 0 12px">Hi <b>${toName}</b>,</p>
        <p style="font-size:15px;color:#475569;margin:0 0 20px">
          <b>${fromName}</b> shared an outfit with you on Sortech Wardrobe:
          <b style="color:#2166f0">"${outfitName}"</b>
        </p>
        ${message ? `<p style="font-size:14px;color:#64748b;background:#f1f5ff;border-radius:10px;padding:14px;margin:0 0 20px">"${message}"</p>` : ""}
        <a href="${appUrl}/inbox"
           style="display:inline-block;background:#2166f0;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:15px">
          View outfit →
        </a>
        <p style="font-size:12px;color:#94a3b8;margin-top:28px">
          You received this because you have an account on Sortech Wardrobe.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Sortech Wardrobe" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `${fromName} shared an outfit with you 👕`,
    html,
  });
}

module.exports = { sendOutfitSharedEmail };
