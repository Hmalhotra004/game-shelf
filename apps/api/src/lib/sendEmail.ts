import path from "node:path";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
) {
  await transporter.sendMail({
    from: `"Game Shelf" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,

    attachments: [
      {
        filename: "game-shelf-logo.png",
        path: path.join(process.cwd(), "src/assets/icon.png"),
        cid: "game-shelf-logo",
      },
    ],
  });
}
