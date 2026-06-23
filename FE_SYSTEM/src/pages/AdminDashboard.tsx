import React from 'react';
import { Card, Tag, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowUpOutlined } from '@ant-design/icons';

export const AdminDashboard: React.FC = () => {
  // Recent log data
  const logs = [
    {
      id: '1',
      name: 'Trần Văn Nam',
      mssv: 'KTPM2021',
      time: '08:05 AM',
      status: 'Có mặt',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEnPTyFsWDbUuftOvAHW8_aQnHglGTBCQYHkpRlG3DAwTzYS4q8VxOcFKyBC5I8WEE5BXnCAD5h-yMn5Scg_6S-3b1EWO9plIi_MGBE82UOWPR_iPSCedqKqc9Ak1hs7Z30F2S_DIlSvIdVPQC3xwJ3GxvcXq7-lLdq8_ElV6kJAyQABZGIprnjUS2ZuO9XsRAJnwKOtTFuDtXV6sQumPzhWZ8sO2RXfZT3aG7qf0nw7dHiVWO2pINJ7T0w4ZAx8lR2sxa62WX9fVs'
    },
    {
      id: '2',
      name: 'Nguyễn Thị Lan',
      mssv: 'KTPM2021',
      time: '08:12 AM',
      status: 'Đi muộn',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxtA49YHLZujItBbkRNXIdk7FhORvSIkaFju7l_muu2O9O6i31sQ8qg9S-nfYSVAitIlN0wUcGcpX7ZPYDYpy6B3H0RoyPcnNVxrxo53us3yJWjRzSeXkvdwrRj63Cb8-_gKV1xUF7g3fNoW1sIwjjAZliD1B3mGPMiqfvtzzeIxqqhYcKwWoZpS7JJV5CDXCjDSZ-VRfp1zAMujM2GpniXWRxIEp8_7qhqmKxpa51QvRz4-B83jva8VCRa2V7cypgHe8X6Jnyn0ti'
    },
    {
      id: '3',
      name: 'Lê Hoàng Bảo',
      mssv: 'MMT2022',
      time: '09:00 AM',
      status: 'Có mặt',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByf2BH8hlnRXLH3ACh4epEt0IwTKmdKTTBgng19JDbaW-LdN8TXf0T-vKxps_XQ9cSAicCOgdxT8HX3VxxeEhQYQFFxCUSNQdMrWaPDCQNfYZolvQeCKCwmV19cfnJl04TLST5pVA3iHtOpPeXCSzflFMTs7nhcC8vhhVxrmqAuHwiUEOjTuFpL7TAd7RqVJtK_fE-T9P3wLzt8BUMzMdMCopRt4gbxJBKlxADmhG_rP92A5dGqipxrZXhC0LqAR1EJzgRMvDgmAex'
    },
    {
      id: '4',
      name: 'Phạm Mai Anh',
      mssv: 'QTKD2020',
      time: '09:02 AM',
      status: 'Có mặt',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJGXnlHL5Xj6b7845Yi4-1T52uPAY7kmK3ZT8jQQRQm9Z5NSH9SpThP14vKlx35Aerx54DOi4RBw9Lb8JEVeX2z9622MxcpvpXAoaOdoznT8Sygud5flF_OzwUPV7Dej_Q-V9yMzbG_a_vJVXScFZ7s_GM1pAodggUKqcauyboh0lyzesJWGEIpxnkxlT6BIXwfhXN8i-ih15dj_TRpe05r63g2oqg0hB_R0uAzj55EZ5ftE60rZaS5GOAXKTAifB7SGxda46AKS5N'
    },
    {
      id: '5',
      name: 'Vũ Trí Dũng',
      mssv: 'KTPM2021',
      time: '09:15 AM',
      status: 'Đi muộn',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjzInD8HhIUgahO5b671qsI14DSeLObeGtxy30OaGYPdlSdnuV7LLY_Arwq6ichPmfxpIWyDdfvx4p4y10hZIjMFHoYbrr0MT1MJq-xlJK6Jm8xDEWv3W0zq7Y_s5XVFXtYh5c3FxdNs0m9kAszDYuWkHNzrrwTUORjgZGaLVKazLV3HGswxXdCs_v32BickIDsh9WyYcYGv3i1HwJ4LG2mLJq9BxwN6SNCXyKzQH9UwuP4lsBfj1BFruMigMtf3GIZASsuyxjZ-_5'
    }
  ];

  // Simulated chart data
  const chartHours = [
    { label: '7:00', height: '20%' },
    { label: '8:00', height: '45%' },
    { label: '9:00', height: '80%' },
    { label: '10:00', height: '55%' },
    { label: '11:00', height: '25%' },
    { label: '12:00', height: '10%' },
    { label: '13:00', height: '60%' },
    { label: '14:00', height: '90%' },
    { label: '15:00', height: '40%' },
    { label: '16:00', height: '15%' },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-background font-bold">Thống kê tổng quan</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Cập nhật dữ liệu điểm danh hệ thống theo thời gian thực.</p>
      </div>

      {/* Stats Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Students */}
        <Card className="rounded-xl shadow-soft-card border border-outline-variant/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <span className="inline-flex items-center gap-1 font-semibold text-xs text-secondary bg-secondary-container/20 px-2.5 py-1 rounded-full">
              <ArrowUpOutlined className="text-xs" /> +2.5%
            </span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Tổng sinh viên</p>
          <p className="font-headline-lg text-headline-lg text-on-surface font-bold">12,450</p>
        </Card>

        {/* Card 2: Teachers */}
        <Card className="rounded-xl shadow-soft-card border border-outline-variant/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[24px]">person_4</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Giảng viên</p>
          <p className="font-headline-lg text-headline-lg text-on-surface font-bold">342</p>
        </Card>

        {/* Card 3: Classes */}
        <Card className="rounded-xl shadow-soft-card border border-outline-variant/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary-container/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">class</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Lớp học phần</p>
          <p className="font-headline-lg text-headline-lg text-on-surface font-bold">1,205</p>
        </Card>

        {/* Card 4: Kiosks */}
        <Card className="rounded-xl shadow-soft-card border border-outline-variant/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">aod</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant bg-surface-variant/50 px-2.5 py-1 rounded-full font-medium">
              24/25 Online
            </span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Thiết bị Kiosk</p>
          <p className="font-headline-lg text-headline-lg text-on-surface font-bold">25</p>
        </Card>

      </div>

      {/* Main Content Area: Chart & List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-surface-container-lowest rounded-xl p-6 shadow-soft-card border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Lượt điểm danh hôm nay</h3>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>

          <div className="flex-1 min-h-[300px] border border-outline-variant/30 rounded-lg relative overflow-hidden flex items-end justify-between px-4 pb-4 pt-10">
            {/* Background grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(#3525cd 1px, transparent 1px), linear-gradient(90deg, #3525cd 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            ></div>

            {/* Custom pure CSS mock bars */}
            {chartHours.map((bar, idx) => (
              <div
                key={idx}
                style={{ height: bar.height }}
                className="w-1/12 bg-primary/30 hover:bg-primary rounded-t-md transition-all duration-300 relative group cursor-pointer"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-semibold text-[11px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                  Ca {bar.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-3 text-xs text-on-surface-variant/80 font-medium px-2">
            {chartHours.map((bar, idx) => (
              <span key={idx} className="w-1/12 text-center">{bar.label}</span>
            ))}
          </div>
        </div>

        {/* Recent Attendance List */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-soft-card border border-outline-variant/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Mới nhất</h3>
            <Link to="/attendance-monitor" className="text-xs font-semibold text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-4 flex-grow">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 py-2.5 border-b border-outline-variant/30 last:border-0">
                <Avatar
                  src={log.avatar}
                  size={40}
                  className="border border-outline-variant/40 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-on-surface truncate">{log.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {log.mssv} • {log.time}
                  </p>
                </div>
                <Tag
                  color={log.status === 'Có mặt' ? 'success' : 'warning'}
                  className="m-0 border-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                >
                  {log.status}
                </Tag>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default AdminDashboard;
