import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;

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

  await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
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
                <p style="color:#94a3b8;font-size:12px;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:2px;">Your verification code</p>
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