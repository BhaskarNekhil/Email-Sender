# Basic Email Sender

Small Node.js + Express + Nodemailer app. Enter comma-separated addresses in **To**; they are sent as regular visible recipients (not CC or BCC).

## Setup

1. Install Node.js, then run `npm install`.
2. Copy `.env.example` to `.env` and fill in your SMTP credentials.
3. Run `npm start` and open `http://localhost:3000`.

For Gmail, use a Google App Password with 2-Step Verification enabled. Keep `.env` private and never commit it.
