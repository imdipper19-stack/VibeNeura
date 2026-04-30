import 'server-only';
import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = 'vibeneura <noreply@vibeneura.online>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vibeneura.online';

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${APP_URL}/api/auth/verify-email?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Подтвердите email — vibeneura',
    html: emailTemplate(
      'Подтвердите ваш email',
      `<p style="color:#b9cac9;font-size:15px;line-height:1.6">
        Вы зарегистрировались на <strong style="color:#00fbfb">vibeneura</strong>.<br/>
        Нажмите кнопку ниже, чтобы подтвердить email и начать пользоваться платформой.
      </p>`,
      link,
      'Подтвердить email',
    ),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${APP_URL}/ru/reset-password?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Сброс пароля — vibeneura',
    html: emailTemplate(
      'Сброс пароля',
      `<p style="color:#b9cac9;font-size:15px;line-height:1.6">
        Вы запросили сброс пароля на <strong style="color:#00fbfb">vibeneura</strong>.<br/>
        Нажмите кнопку ниже, чтобы установить новый пароль. Ссылка действует 1 час.
      </p>`,
      link,
      'Сбросить пароль',
    ),
  });
}

function emailTemplate(title: string, body: string, link: string, btnText: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0d1515;font-family:'Inter',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1515;padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#151d1d;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:40px">
        <tr><td>
          <div style="font-size:20px;font-weight:700;color:#00fbfb;margin-bottom:24px">✦ vibeneura</div>
          <h1 style="color:#dbe4e3;font-size:22px;margin:0 0 16px">${title}</h1>
          ${body}
          <a href="${link}" style="display:inline-block;margin-top:24px;padding:12px 32px;background:linear-gradient(135deg,#00fbfb,#568dff);color:#000510;font-weight:600;font-size:14px;border-radius:999px;text-decoration:none">${btnText}</a>
          <p style="color:#839493;font-size:12px;margin-top:32px">Если вы не регистрировались на vibeneura, проигнорируйте это письмо.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
