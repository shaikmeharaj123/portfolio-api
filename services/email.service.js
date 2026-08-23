const nodemailer = require("nodemailer");

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

exports.sendContactEmail = async (contact) => {
  const transporter = getTransporter();
  const toEmail = process.env.CONTACT_EMAIL_TO || process.env.ADMIN_EMAIL;
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!transporter || !toEmail || !fromEmail) {
    return {
      skipped: true,
      reason: "Missing SMTP or recipient configuration",
    };
  }

  const subject = contact.subject || `New portfolio inquiry from ${contact.name}`;
  const text = [
    `New contact message received from your portfolio website.`,
    "",
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    contact.phone ? `Phone: ${contact.phone}` : null,
    contact.page ? `Page: ${contact.page}` : null,
    "",
    `Subject: ${subject}`,
    "",
    `Message:`,
    contact.message,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 12px">New portfolio inquiry</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ""}
      ${contact.page ? `<p><strong>Page:</strong> ${contact.page}</p>` : ""}
      <p><strong>Subject:</strong> ${subject}</p>
      <div style="margin-top:16px;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb">
        <p style="margin:0 0 8px;font-weight:700">Message</p>
        <p style="margin:0;white-space:pre-wrap">${contact.message}</p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    replyTo: contact.email,
    subject,
    text,
    html,
  });
};
