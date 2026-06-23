import React from 'react';
import { Card, Table, Tag, Button, Progress, Tooltip } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { ScanOutlined, EyeOutlined, RiseOutlined } from '@ant-design/icons';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const classes = [
    {
      key: '1',
      time: '07:00 - 09:15',
      shift: 'Ca 1',
      subject: 'Cơ sở Dữ liệu (IT102)',
      classCode: 'DHKTPM17A',
      room: 'Phòng A2.104',
      status: 'active',
      attendance: '38/40',
    },
    {
      key: '2',
      time: '09:30 - 11:45',
      shift: 'Ca 2',
      subject: 'Cấu trúc Dữ liệu (IT201)',
      classCode: 'DHKTPM17B',
      room: 'Phòng A2.105',
      status: 'ended',
      attendance: '42/45',
    },
    {
      key: '3',
      time: '13:00 - 15:15',
      shift: 'Ca 3',
      subject: 'Phát triển ƯD Web (IT305)',
      classCode: 'DHKTPM16C',
      room: 'Phòng B1.201',
      status: 'upcoming',
      attendance: '0/38',
    },
  ];

  const columns = [
    {
      title: <span className="font-semibold text-xs text-on-surface-variant">Thời gian</span>,
      dataIndex: 'time',
      key: 'time',
      render: (text: string, record: any) => (
        <div>
          <p className="font-semibold text-sm text-on-surface">{text}</p>
          <p className="text-xs text-on-surface-variant">{record.shift}</p>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-xs text-on-surface-variant">Môn học / Lớp</span>,
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string, record: any) => (
        <div>
          <p className="font-semibold text-sm text-primary hover:underline cursor-pointer" onClick={() => navigate('/attendance-monitor')}>
            {text}
          </p>
          <p className="text-xs text-on-surface-variant">Lớp: {record.classCode}</p>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-xs text-on-surface-variant">Phòng học</span>,
      dataIndex: 'room',
      key: 'room',
      render: (text: string) => <span className="text-sm font-medium text-on-surface">{text}</span>,
    },
    {
      title: <span className="font-semibold text-xs text-on-surface-variant">Trạng thái điểm danh</span>,
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => {
        if (status === 'active') {
          return (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-semibold text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span>Đang diễn ra ({record.attendance})</span>
            </div>
          );
        } else if (status === 'ended') {
          return (
            <Tag className="m-0 border-0 bg-outline-variant/30 text-on-surface-variant rounded-full font-semibold px-3 py-0.5 text-xs">
              Đã kết thúc ({record.attendance})
            </Tag>
          );
        } else {
          return (
            <Tag className="m-0 border border-outline-variant/50 bg-surface-container text-on-surface-variant rounded-full font-semibold px-3 py-0.5 text-xs">
              Chưa bắt đầu
            </Tag>
          );
        }
      },
    },
    {
      title: '',
      key: 'actions',
      render: () => (
        <div className="text-right">
          <Tooltip title="Chi tiết điểm danh">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate('/attendance-monitor')}
              className="text-primary hover:bg-primary-container/20 rounded-full"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Tổng quan hôm nay</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Theo dõi hoạt động giảng dạy và điểm danh sinh viên.</p>
        </div>
        <Button
          type="primary"
          icon={<ScanOutlined />}
          onClick={() => navigate('/attendance-monitor')}
          className="bg-primary hover:bg-surface-tint border-transparent rounded-full px-6 py-2.5 h-auto text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 duration-150"
        >
          Điểm danh buổi học
        </Button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Classes Managed */}
        <Card className="rounded-xl shadow-soft-card border border-outline-variant/60 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <span className="material-symbols-outlined text-[72px]">school</span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Tổng số lớp phụ trách</p>
          <div className="flex items-end gap-3 mt-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none">06</span>
            <span className="font-semibold text-[11px] text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-md mb-1">
              Học kỳ I, 2024
            </span>
          </div>
        </Card>

        {/* Card 2: Attendance Rate */}
        <Card className="rounded-xl shadow-soft-card border border-outline-variant/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tỉ lệ có mặt hôm nay</p>
            <span className="inline-flex items-center gap-1 font-semibold text-xs text-secondary bg-secondary-container/20 px-2 py-0.5 rounded">
              <RiseOutlined /> +2.4%
            </span>
          </div>
          <div className="flex items-end mt-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none">94.5%</span>
          </div>
          <div className="w-full mt-4">
            <Progress percent={94.5} strokeColor="#006c49" trailColor="#e5eeff" size="small" showInfo={false} />
          </div>
        </Card>

        {/* Card 3: Absent Students Alert */}
        <Card className="rounded-xl shadow-soft-card border border-outline-variant/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Sinh viên vắng (Hôm nay)</p>
          <div className="flex items-end gap-3 mt-2">
            <span className="font-display-lg text-display-lg text-error font-bold leading-none">12</span>
            <span className="text-xs font-semibold text-on-surface-variant mb-1">/ 240 tổng số</span>
          </div>
          <div className="mt-3 text-xs text-error font-semibold flex items-center gap-1.5 bg-error-container/10 px-2 py-1.5 rounded border border-error/10">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Lưu ý 3 SV vắng quá số buổi quy định!</span>
          </div>
        </Card>

      </div>

      {/* List of Today's Classes */}
      <Card className="rounded-xl shadow-soft-card border border-outline-variant/50 overflow-hidden" title={<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface m-0">Lịch trình giảng dạy hôm nay</h3>} extra={<Link to="/attendance-monitor" className="text-xs font-semibold text-primary hover:underline">Xem lịch trình đầy đủ</Link>}>
        <Table
          dataSource={classes}
          columns={columns}
          pagination={false}
          className="rounded-lg overflow-hidden border border-outline-variant/30"
          rowClassName={(record) => record.status === 'active' ? 'bg-primary-container/5 hover:bg-primary-container/10 transition-colors' : 'hover:bg-surface-container-low transition-colors'}
        />
      </Card>
      
    </div>
  );
};
export default TeacherDashboard;
