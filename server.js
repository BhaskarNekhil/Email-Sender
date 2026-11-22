require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP settings are missing. Check your .env file.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    requireTLS: Number(SMTP_PORT) === 587,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

app.post('/api/send', async (req, res) => {
  const { recipients, subject, message } = req.body || {};
  if (typeof recipients !== 'string' || !recipients.trim()) {
    return res.status(400).json({ error: 'Enter at least one recipient email address.' });
  }
  if (typeof subject !== 'string' || !subject.trim()) {
    return res.status(400).json({ error: 'Enter a subject.' });
  }
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Enter a message.' });
  }

  const emails = [...new Set(recipients.split(',').map((email) => email.trim()).filter(Boolean))];
  const emailPattern = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;
  const invalid = emails.filter((email) => !emailPattern.test(email));
  if (!emails.length || invalid.length) {
    return res.status(400).json({ error: `Invalid email address${invalid.length > 1 ? 'es' : ''}: ${invalid.join(', ') || 'check the recipient list'}` });
  }

  try {
    const transporter = createTransporter();
    // Send separate messages so each person sees only their own address in To.
    for (const email of emails) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: subject.trim(),
        text: message
      });
    }
    res.json({ message: `Email sent separately to ${emails.length} recipient${emails.length === 1 ? '' : 's'}.` });
  } catch (error) {
    console.error('Email send failed:', error.code || 'UNKNOWN', error.message);
    const networkError = ['ENOTFOUND', 'ECONNECTION', 'ECONNREFUSED', 'ETIMEDOUT', 'ESOCKET'].includes(error.code);
    res.status(500).json({
      error: networkError
        ? 'Could not connect to Gmail SMTP. Check your internet/DNS or try SMTP_PORT=465.'
        : 'Could not send the email. Check the Gmail App Password and SMTP settings.'
    });
  }
});

app.listen(port, () => console.log(`Email Sender running at http://localhost:${port}`));
