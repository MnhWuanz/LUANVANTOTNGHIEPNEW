import nodemailer from 'nodemailer';
import 'dotenv/config';

type AttendanceSuccessEmailParams = {
  to: string;
  studentName?: string | null;
  studentCode?: string | null;
  checkinTime?: Date | null;
  status: string;
};

const APP_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.APP_PASSWORD?.trim(),
  },
});

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
    await transporter.sendMail({
      from,
      to: params.to,
      subject: 'Diem danh thanh cong',
      text: lines.join('\n'),
      html: lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(''),
    });

    console.log(`Attendance success email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error('Send attendance success email failed:', error);
    return false;
  }
}
