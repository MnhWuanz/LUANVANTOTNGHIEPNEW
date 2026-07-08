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
  const from = getMailFrom();

  if (!from) {
    console.error(
      'Skip attendance success email: missing EMAIL_USER or APP_PASSWORD',
    );
    return false;
  }

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

  try {
    const { smtpIpv4Host, transporter } = await createAttendanceTransporter();

    console.log(
      `Sending attendance success email via ${SMTP_HOST}:${SMTP_PORT} (${smtpIpv4Host})`,
    );

    const info = await transporter.sendMail({
      from,
      to: params.to,
      subject: 'Diem danh thanh cong',
      text: lines.join('\n'),
      html: lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(''),
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
