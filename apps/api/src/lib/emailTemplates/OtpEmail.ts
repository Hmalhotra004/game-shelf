export type OtpEmailType = "sign-in" | "email-verification" | "forget-password";

type OtpEmailContent = {
  subject: string;
  heading: string;
  intro: string;
};

const CONTENT: Record<OtpEmailType, OtpEmailContent> = {
  "sign-in": {
    subject: "Your Game Shelf login code",
    heading: "Log in to your account",
    intro: "Use the code below to finish signing in to Game Shelf.",
  },
  "email-verification": {
    subject: "Verify your Game Shelf email",
    heading: "Verify your email address",
    intro:
      "Welcome to Game Shelf! Enter the code below to confirm your email address.",
  },
  "forget-password": {
    subject: "Reset your Game Shelf password",
    heading: "Reset your password",
    intro:
      "We received a request to reset your password. Enter the code below to continue.",
  },
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Colors are the hex equivalents of the app's semantic theme tokens
 * (light + dark). Emails can't use CSS variables, so values are inlined.
 */
const LIGHT = {
  background: "#f5f5f5", // secondary / muted
  card: "#ffffff", // card
  foreground: "#0a0a0a", // foreground
  muted: "#f5f5f5", // muted
  mutedForeground: "#737373", // muted-foreground
  border: "#e5e5e5", // border
  primary: "#171717", // primary
  primaryForeground: "#fafafa", // primary-foreground
};

const DARK = {
  background: "#000000",
  card: "#0a0a0a",
  foreground: "#fafafa",
  muted: "#262626",
  mutedForeground: "#a3a3a3",
  border: "#262626",
  primary: "#fafafa",
  primaryForeground: "#171717",
};

export function buildOtpEmail({
  otp,
  type,
  expiresInMinutes = 5,
}: {
  otp: string;
  type: OtpEmailType;
  expiresInMinutes?: number;
}) {
  const { subject, heading, intro } = CONTENT[type];
  const safeOtp = escapeHtml(otp);
  const year = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${escapeHtml(subject)}</title>
    <style>
      :root { color-scheme: light dark; supported-color-schemes: light dark; }
      @media (prefers-color-scheme: dark) {
        .bg-page { background-color: ${DARK.background} !important; }
        .bg-card { background-color: ${DARK.card} !important; border-color: ${DARK.border} !important; }
        .bg-muted { background-color: ${DARK.muted} !important; border-color: ${DARK.border} !important; }
        .bg-primary { background-color: ${DARK.primary} !important; }
        .text-primary-fg { color: ${DARK.primaryForeground} !important; }
        .text-fg { color: ${DARK.foreground} !important; }
        .text-muted-fg { color: ${DARK.mutedForeground} !important; }
        .border-b { border-color: ${DARK.border} !important; }
      }
      @media only screen and (max-width: 480px) {
        .px { padding-left: 20px !important; padding-right: 20px !important; }
        .otp { font-size: 30px !important; letter-spacing: 8px !important; }
      }
    </style>
  </head>
  <body class="bg-page" style="margin:0;padding:0;background-color:${LIGHT.background};">
    <!-- Preheader (inbox preview text) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Your Game Shelf verification code is ${safeOtp}. It expires in ${expiresInMinutes} minutes.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-page" style="background-color:${LIGHT.background};">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-card" style="max-width:480px;background-color:${LIGHT.card};border:1px solid ${LIGHT.border};border-radius:16px;">

            <!-- Brand -->
            <tr>
              <td align="center" class="px" style="padding:36px 32px 8px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" class="bg-primary" width="44" height="44" style="width:44px;height:44px;background-color:${LIGHT.primary};border-radius:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;line-height:44px;">
                      <span class="text-primary-fg" style="color:${LIGHT.primaryForeground};">G</span>
                    </td>
                  </tr>
                </table>
                <div class="text-fg" style="margin-top:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.2px;color:${LIGHT.foreground};">
                  Game Shelf
                </div>
              </td>
            </tr>

            <!-- Heading -->
            <tr>
              <td align="center" class="px" style="padding:24px 32px 0 32px;">
                <h1 class="text-fg" style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:24px;line-height:32px;font-weight:700;letter-spacing:-0.4px;color:${LIGHT.foreground};">
                  ${escapeHtml(heading)}
                </h1>
                <p class="text-muted-fg" style="margin:12px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:${LIGHT.mutedForeground};">
                  ${escapeHtml(intro)}
                </p>
              </td>
            </tr>

            <!-- OTP -->
            <tr>
              <td align="center" class="px" style="padding:28px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" class="bg-muted" style="background-color:${LIGHT.muted};border:1px solid ${LIGHT.border};border-radius:12px;padding:20px 16px;">
                      <div class="otp text-fg" style="font-family:'SF Mono',SFMono-Regular,ui-monospace,Menlo,Consolas,'Courier New',monospace;font-size:36px;line-height:44px;font-weight:700;letter-spacing:12px;padding-left:12px;color:${LIGHT.foreground};">
                        ${safeOtp}
                      </div>
                    </td>
                  </tr>
                </table>
                <p class="text-muted-fg" style="margin:14px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:${LIGHT.mutedForeground};">
                  This code expires in <strong class="text-fg" style="color:${LIGHT.foreground};">${expiresInMinutes} minutes</strong>.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td class="px" style="padding:28px 32px 0 32px;">
                <div class="border-b" style="border-top:1px solid ${LIGHT.border};font-size:0;line-height:0;height:0;">&nbsp;</div>
              </td>
            </tr>

            <!-- Security note -->
            <tr>
              <td align="center" class="px" style="padding:20px 32px 32px 32px;">
                <p class="text-muted-fg" style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:${LIGHT.mutedForeground};">
                  Didn't request this? You can safely ignore this email. Never share this code with anyone — the Game Shelf team will never ask for it.
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
            <tr>
              <td align="center" style="padding:20px 16px 0 16px;">
                <p class="text-muted-fg" style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${LIGHT.mutedForeground};">
                  &copy; ${year} Game Shelf &middot; Track your games, your way.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${heading}

${intro}

Your verification code: ${otp}

This code expires in ${expiresInMinutes} minutes.
If you didn't request this, you can safely ignore this email. Never share this code with anyone.

- Game Shelf`;

  return { subject, html, text };
}
