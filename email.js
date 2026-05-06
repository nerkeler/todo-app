/**
 * 邮件发送模块 - 使用 nodemailer
 */
const nodemailer = require('nodemailer');

const SMTP_HOST   = process.env.TODO_SMTP_HOST     || 'smtp.163.com';
const SMTP_PORT   = parseInt(process.env.TODO_SMTP_PORT || '465');
const SMTP_USER   = process.env.TODO_SMTP_USER     || '';
const SMTP_PASS   = process.env.TODO_SMTP_PASS     || '';
const DEFAULT_TO  = process.env.TODO_DEFAULT_RECIPIENT || '';

let transporter = null;

function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10000,
    });
  }
  return transporter;
}

async function sendEmail(to, subject, body) {
  const t = getTransporter();
  if (!t) throw new Error('SMTP not configured');
  const info = await t.sendMail({
    from: `"TODO提醒" <${SMTP_USER}>`,
    to: to || DEFAULT_TO,
    subject,
    text: body,
  });
  return { success: true, messageId: info.messageId };
}

module.exports = { sendEmail, DEFAULT_TO };