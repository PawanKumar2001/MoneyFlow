import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(
  email: string,
  code: string,
  type: "SIGNUP" | "LOGIN"
) {
  const subject =
    type === "SIGNUP"
      ? "Verify your MoneyFlow account"
      : "Your MoneyFlow login code";

  const heading =
    type === "SIGNUP"
      ? "Welcome to MoneyFlow!"
      : "Your login verification code";

  const subtext =
    type === "SIGNUP"
      ? "Enter this code to verify your email and complete signup."
      : "Enter this code to complete your login.";

  await transporter.sendMail({
    from: `MoneyFlow <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#000000;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:480px;margin:0 auto;padding:40px 20px;">

            <!-- Logo -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;background:#ffffff;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;color:#000000;">M</div>
                <span style="font-size:24px;font-weight:700;color:#ffffff;">MoneyFlow</span>
              </div>
            </div>

            <!-- Card -->
            <div style="background:#111111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;">
                ${heading}
              </h1>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 32px 0;text-align:center;">
                ${subtext}
              </p>

              <!-- OTP Code -->
              <div style="background:#000000;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="color:#94a3b8;font-size:12px;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:2px;">
                  Your verification code
                </p>
                <p style="color:#ffffff;font-size:40px;font-weight:700;letter-spacing:12px;margin:0;font-family:monospace;">
                  ${code}
                </p>
              </div>

              <p style="color:#64748b;font-size:12px;text-align:center;margin:0 0 8px 0;">
                This code expires in <strong style="color:#94a3b8;">10 minutes</strong>
              </p>
              <p style="color:#64748b;font-size:12px;text-align:center;margin:0;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
              © ${new Date().getFullYear()} MoneyFlow. Know exactly where your money goes.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
) {
  await transporter.sendMail({
    from: `MoneyFlow <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Reset your MoneyFlow password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#000000;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:480px;margin:0 auto;padding:40px 20px;">

            <!-- Logo -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;background:#ffffff;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;color:#000000;">M</div>
                <span style="font-size:24px;font-weight:700;color:#ffffff;">MoneyFlow</span>
              </div>
            </div>

            <!-- Card -->
            <div style="background:#111111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px 0;text-align:center;">
                Reset your password
              </h1>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 32px 0;text-align:center;">
                Click the button below to reset your MoneyFlow password.
              </p>

              <!-- Button -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${resetLink}"
                  style="display:inline-block;background:#ffffff;color:#000000;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
                  Reset Password
                </a>
              </div>

              <p style="color:#64748b;font-size:12px;text-align:center;margin:0 0 8px 0;">
                This link expires in <strong style="color:#94a3b8;">1 hour</strong>
              </p>
              <p style="color:#64748b;font-size:12px;text-align:center;margin:0 0 16px 0;">
                If you didn't request this, you can safely ignore this email.
              </p>

              <!-- Link fallback -->
              <p style="color:#475569;font-size:11px;text-align:center;margin:0;word-break:break-all;">
                Or copy this link: ${resetLink}
              </p>
            </div>

            <!-- Footer -->
            <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
              © ${new Date().getFullYear()} MoneyFlow. Know exactly where your money goes.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendMonthlySummaryEmail(
  email: string,
  username: string,
  data: {
    month: string;
    year: number;
    totalIncome: number;
    totalExpenses: number;
    remaining: number;
    savingsPercent: string;
    topCategory: string;
    currency: string;
  }
) {
  const { month, year, totalIncome, totalExpenses,
    remaining, savingsPercent, topCategory, currency } = data;

  await transporter.sendMail({
    from: `MoneyFlow <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Your MoneyFlow Summary — ${month} ${year}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#000000;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:480px;margin:0 auto;padding:40px 20px;">

            <!-- Logo -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;background:#ffffff;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;color:#000000;">M</div>
                <span style="font-size:24px;font-weight:700;color:#ffffff;">MoneyFlow</span>
              </div>
            </div>

            <!-- Card -->
            <div style="background:#111111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 4px 0;text-align:center;">
                ${month} ${year} Summary
              </h1>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 32px 0;text-align:center;">
                Hi ${username}, here's how you did this month!
              </p>

              <!-- Stats -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                <div style="background:#000000;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;text-align:center;">
                  <p style="color:#64748b;font-size:11px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:1px;">Income</p>
                  <p style="color:#ffffff;font-size:20px;font-weight:700;margin:0;">${currency}${totalIncome.toLocaleString()}</p>
                </div>
                <div style="background:#000000;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;text-align:center;">
                  <p style="color:#64748b;font-size:11px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:1px;">Expenses</p>
                  <p style="color:#ef4444;font-size:20px;font-weight:700;margin:0;">${currency}${totalExpenses.toLocaleString()}</p>
                </div>
                <div style="background:#000000;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;text-align:center;">
                  <p style="color:#64748b;font-size:11px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:1px;">Remaining</p>
                  <p style="color:#10b981;font-size:20px;font-weight:700;margin:0;">${currency}${remaining.toLocaleString()}</p>
                </div>
                <div style="background:#000000;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;text-align:center;">
                  <p style="color:#64748b;font-size:11px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:1px;">Savings</p>
                  <p style="color:#6366f1;font-size:20px;font-weight:700;margin:0;">${savingsPercent}%</p>
                </div>
              </div>

              <!-- Top Category -->
              <div style="background:#000000;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
                <p style="color:#64748b;font-size:12px;margin:0 0 4px 0;">Top Spending Category</p>
                <p style="color:#ffffff;font-size:16px;font-weight:600;margin:0;">${topCategory}</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard/summary"
                  style="display:inline-block;background:#ffffff;color:#000000;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
                  View Full Summary
                </a>
              </div>
            </div>

            <!-- Footer -->
            <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
              © ${new Date().getFullYear()} MoneyFlow. Know exactly where your money goes.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}