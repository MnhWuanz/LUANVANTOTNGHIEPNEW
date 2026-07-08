import nodemailer from 'nodemailer';
import dns from 'dns';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import 'dotenv/config';

type AttendanceSuccessEmailParams = {
  to: string;
  studentName?: string | null;
  studentCode?: string | null;
  checkinTime?: Date | null;
  status: string;
};

type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 587;

dns.setDefaultResultOrder('ipv4first');

function getMailFrom() {
  const emailUser = process.env.EMAIL_USER?.trim();
  const appPassword = process.env.APP_PASSWORD?.trim();

  if (!emailUser || !appPassword) {
    return null;
  }

  return {
    name: 'SYSTEM ATTENDANCE',
    address: emailUser,
  };
}

function getResendFrom() {
  return process.env.RESEND_FROM_EMAIL?.trim() || null;
}

function formatCheckinTime(checkinTime?: Date | null) {
  if (!checkinTime) {
    return 'Khong co thoi gian diem danh';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(checkinTime);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAttendanceEmailContent(
  params: AttendanceSuccessEmailParams,
): EmailContent {
  const studentLabel = [params.studentName, params.studentCode]
    .filter(Boolean)
    .join(' - ');
  const checkinTime = formatCheckinTime(params.checkinTime);
  const lines = [
    'Diem danh thanh cong.',
    studentLabel ? `Sinh vien: ${studentLabel}` : null,
    `Thoi gian: ${checkinTime}`,
    `Trang thai: ${params.status}`,
  ].filter(Boolean) as string[];

  return {
    subject: 'Diem danh thanh cong',
    text: lines.join('\n'),
    html: lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(''),
  };
}

async function sendViaResend(params: {
  from: string;
  to: string;
  content: EmailContent;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    console.log('Sending attendance success email via Resend API');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: [params.to],
        subject: params.content.subject,
        html: params.content.html,
        text: params.content.text,
      }),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('Send attendance success email via Resend failed:', result);
      return false;
    }

    console.log('Attendance success email Resend result:', result);
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveSmtpIpv4Host() {
  const addresses = await dns.promises.resolve4(SMTP_HOST);
  const smtpIpv4Host = addresses[0];

  if (!smtpIpv4Host) {
    throw new Error(`No IPv4 address found for ${SMTP_HOST}`);
  }

  return smtpIpv4Host;
}

async function createAttendanceTransporter() {
  const smtpIpv4Host = await resolveSmtpIpv4Host();
  const smtpOptions: SMTPTransport.Options = {
    host: smtpIpv4Host,
    port: SMTP_PORT,
    secure: false,
    requireTLS: true,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
      user: process.env.EMAIL_USER?.trim(),
      pass: process.env.APP_PASSWORD?.trim(),
    },
    tls: {
      servername: SMTP_HOST,
    },
  };

  return {
    smtpIpv4Host,
    transporter: nodemailer.createTransport(smtpOptions),
  };
}

export async function sendAttendanceSuccessEmail(
  params: AttendanceSuccessEmailParams,
) {
  const content = buildAttendanceEmailContent(params);
  const resendFrom = getResendFrom();
  const hasResendApiKey = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasResendFrom = Boolean(resendFrom);

  if (hasResendApiKey && hasResendFrom) {
    return sendViaResend({
      from: resendFrom,
      to: params.to,
      content,
    });
  }

  if (hasResendApiKey || hasResendFrom) {
    console.error('Resend email config incomplete:', {
      hasResendApiKey,
      hasResendFrom,
      requiredKeys: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'],
    });
  }

  const from = getMailFrom();

  if (!from) {
    console.error(
      'Skip attendance success email: missing RESEND_API_KEY/RESEND_FROM_EMAIL or EMAIL_USER/APP_PASSWORD',
    );
    return false;
  }

  try {
    const { smtpIpv4Host, transporter } = await createAttendanceTransporter();

    console.log(
      `Sending attendance success email via ${SMTP_HOST}:${SMTP_PORT} (${smtpIpv4Host})`,
    );

    const info = await transporter.sendMail({
      from,
      to: params.to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    console.log('Attendance success email SMTP result:', {
      accepted: info.accepted,
      rejected: info.rejected,
      messageId: info.messageId,
      response: info.response,
    });
    return true;
  } catch (error) {
    console.error('Send attendance success email failed:', error);
    return false;
  }
}
