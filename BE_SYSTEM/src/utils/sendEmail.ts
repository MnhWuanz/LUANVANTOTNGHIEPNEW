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
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

function getMailFrom() {
  if (!process.env.EMAIL_USER || !process.env.APP_PASSWORD) {
    return null;
  }

  return {
    name: 'SYSTEM ATTENDANCE',
    address: process.env.EMAIL_USER,
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
    'Điểm danh thành công.',
    studentLabel ? `Sinh viên: ${studentLabel}` : null,
    `Thời gian: ${checkinTime}`,
    `Trạng thái: ${params.status}`,
  ].filter(Boolean) as string[];

  try {
    await transporter.sendMail({
      from,
      to: params.to,
      subject: 'Điểm danh thành công',
      text: lines.join('\n'),
      html: lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(''),
    });

    return true;
  } catch (error) {
    console.error('Send attendance success email failed:', error);
    return false;
  }
}
