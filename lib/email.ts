import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOrderPaidEmail({
  to,
  productName,
}: {
  to: string;
  productName: string;
}) {
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM;

  if (!transporter || !from) {
    console.warn(
      "Email not sent because SMTP_HOST/SMTP_USER/SMTP_PASS/MAIL_FROM is not fully configured.",
    );
    return;
  }

  await transporter.sendMail({
    from,
    to,
    subject: `Payment successful: ${productName}`,
    text: `Thanks for your purchase. Your payment for ${productName} was successful.`,
    html: `<p>Thanks for your purchase.</p><p>Your payment for <strong>${productName}</strong> was successful.</p>`,
  });
}
