import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: false,
  auth: env.smtpUser ? {
    user: env.smtpUser,
    pass: env.smtpPassword,
  } : undefined,
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!env.smtpHost) {
    console.log(`[Email simulated] To: ${to}, Subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"AgTradeGroup" <${env.fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function sendOrderConfirmation(order: any) {
  const html = `
    <h2>Order Confirmation - AgTradeGroup</h2>
    <p>Thank you for your order, ${order.customerName}!</p>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Total:</strong> ${order.total} EUR</p>
    <p><strong>Delivery to:</strong> ${order.deliveryCity}</p>
    <p>We will contact you shortly to confirm delivery details.</p>
    <hr/>
    <p>AgTradeGroup - Plumbing, Heating & Construction Materials</p>
  `;
  await sendEmail(order.customerEmail, `Order #${order.orderNumber} Confirmed`, html);
}

export async function sendPasswordReset(email: string, resetToken: string) {
  const resetUrl = `${env.baseUrl}/account/reset-password?token=${resetToken}`;
  const html = `
    <h2>Password Reset - AgTradeGroup</h2>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Password Reset Request', html);
}
