import PageHeader from '@/shared/components/page/PageHeader';
import DatePickerCustom from '@/shared/components/datepicker/DatePickerCustom';
import ModalCustom from '@/shared/components/modal/ModalCustom';
import { useNotification } from '@/shared/hooks/useNotification';
import { formatDateToPicker, formatDateToQuery } from '@/shared/utils/date';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { attendanceSessionApi } from '../api/attendance-session-api';
import type {
  AttendanceSession,
  AttendanceSessionStatus,
} from '../types/attendance-session-type';

const statusLabel: Record<AttendanceSessionStatus, string> = {
  NOT_STARTED: 'Chưa bắt đầu',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
};

const statusColor: Record<AttendanceSessionStatus, string> = {
  NOT_STARTED: 'default',
  OPEN: 'processing',
  CLOSED: 'success',
};

function getTodayDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildSummary(sessions: AttendanceSession[]) {
  const total = sessions.length;
  const open = sessions.filter((item) => item.status === 'OPEN').length;
  const notStarted = sessions.filter((item) => item.status === 'NOT_STARTED').length;
  const closed = sessions.filter((item) => item.status === 'CLOSED').length;
  const totalStudents = sessions.reduce((sum, item) => sum + item.totalStudents, 0);
  const attended = sessions.reduce((sum, item) => sum + item.attendedCount, 0);
  const attendanceRate = totalStudents > 0 ? Math.round((attended / totalStudents) * 100) : 0;
  const openWithoutAttendance = sessions.filter(
    (item) => item.status === 'OPEN' && item.attendedCount === 0,
  ).length;

  return {
    total,
    open,
    notStarted,
    closed,
    totalStudents,
    attended,
    attendanceRate,
    openWithoutAttendance,
  };
}

const StatusTag = ({ status }: { status: AttendanceSessionStatus }) => (
  <Tag color={statusColor[status]}>{statusLabel[status]}</Tag>
);

const AttendanceSessionPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const { showNotification } = useNotification();

  const { data, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ['attendance-sessions', selectedDate],
    queryFn: () => attendanceSessionApi.getAll(selectedDate),
  });

  const generateMutation = useMutation({
    mutationFn: attendanceSessionApi.generateToday,
    onSuccess: (res) => {
      showNotification('success', 'Tạo buổi điểm danh', res.message);
      setSelectedDate(res.data.date);
      refetch();
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      showNotification(
        'error',
        'Tạo buổi điểm danh thất bại',
        message || 'Đã có lỗi xảy ra',
      );
    },
  });

  const sessions = useMemo(() => data?.data.sessions ?? [], [data?.data.sessions]);
  const summary = useMemo(() => buildSummary(sessions), [sessions]);

  const columns = [
    {
      title: 'Môn học',
      render: (_: unknown, record: AttendanceSession) => (
        <div>
          <div className="font-semibold">{record.subjectName}</div>
          <Typography.Text type="secondary" className="text-xs">
            {record.courseCode}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      width: 100,
    },
    {
      title: 'Ca học',
      render: (_: unknown, record: AttendanceSession) => (
        <div>
          <div>{record.shift}</div>
          <Typography.Text type="secondary" className="text-xs">
            {formatTime(record.checkinOpenAt)} - {formatTime(record.checkinCloseAt)}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Giáo viên',
      dataIndex: 'teacherName',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center' as const,
      render: (status: AttendanceSessionStatus) => <StatusTag status={status} />,
    },
    {
      title: 'Điểm danh',
      align: 'center' as const,
      render: (_: unknown, record: AttendanceSession) =>
        `${record.attendedCount}/${record.totalStudents}`,
    },
    {
      title: 'Tỷ lệ',
      width: 160,
      render: (_: unknown, record: AttendanceSession) => (
        <Progress percent={record.attendanceRate} size="small" />
      ),
    },
    {
      title: 'Tác vụ',
      align: 'center' as const,
      width: 100,
      render: (_: unknown, record: AttendanceSession) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedSession(record)} />
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Quản lý buổi điểm danh"
        subtitle="Theo dõi phiên điểm danh theo ngày và tạo phiên từ lịch học"
        extra={
          <Space wrap>
            <Button icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              Tạo buổi hôm nay
            </Button>
          </Space>
        }
      />

      <Card className="shadow-sm">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={8} lg={6}>
            <Typography.Text strong>Ngày điểm danh</Typography.Text>
            <div className="mt-2">
              <DatePickerCustom
                value={formatDateToPicker(selectedDate)}
                onChange={(value) => setSelectedDate(formatDateToQuery(value as Dayjs) || getTodayDate())}
                allowClear={false}
              />
            </div>
          </Col>
          <Col xs={24} md={16} lg={18}>
            <Space wrap>
              <Button icon={<CalendarOutlined />} onClick={() => setSelectedDate(getTodayDate())}>
                Hôm nay
              </Button>
              <Tag color="processing">Đã tự cập nhật trạng thái: mở {data?.data.statusUpdated.opened || 0}, đóng {data?.data.statusUpdated.closed || 0}</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {isError && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải danh sách buổi điểm danh"
          description="Vui lòng kiểm tra backend hoặc thử làm mới lại trang."
        />
      )}

      {summary.openWithoutAttendance > 0 && (
        <Alert
          type="warning"
          showIcon
          message="Có buổi đang mở nhưng chưa có lượt điểm danh"
          description={`${summary.openWithoutAttendance} buổi đang mở chưa ghi nhận sinh viên nào. Nên kiểm tra Kiosk/phòng học tương ứng.`}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="h-full shadow-sm">
            <Statistic title="Tổng buổi" value={summary.total} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="h-full shadow-sm">
            <Statistic title="Đang mở" value={summary.open} valueStyle={{ color: '#1677ff' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="h-full shadow-sm">
            <Statistic title="Đã đóng" value={summary.closed} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="h-full shadow-sm">
            <Statistic title="Tỷ lệ điểm danh" value={`${summary.attendanceRate}%`} valueStyle={{ color: '#13c2c2' }} />
            <div className="mt-2 text-sm text-gray-500">
              {summary.attended}/{summary.totalStudents} lượt dự kiến
            </div>
          </Card>
        </Col>
      </Row>

      <Card title={`Danh sách buổi điểm danh ngày ${data?.data.date || selectedDate}`} className="flex-1 shadow-sm">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : sessions.length > 0 ? (
          <Table<AttendanceSession>
            rowKey="id"
            columns={columns}
            dataSource={sessions}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1000 }}
          />
        ) : (
          <Empty description="Không có buổi điểm danh trong ngày này" />
        )}
      </Card>

      <ModalCustom
        open={!!selectedSession}
        title="Chi tiết buổi điểm danh"
        onCancel={() => setSelectedSession(null)}
        width={760}
      >
        {selectedSession && (
          <Descriptions
            bordered
            size="small"
            column={1}
            items={[
              {
                key: 'subject',
                label: 'Môn học',
                children: `${selectedSession.subjectName} (${selectedSession.courseCode})`,
              },
              {
                key: 'teacher',
                label: 'Giáo viên',
                children: selectedSession.teacherName,
              },
              {
                key: 'room',
                label: 'Phòng học',
                children: selectedSession.room,
              },
              {
                key: 'shift',
                label: 'Ca học',
                children: selectedSession.shift,
              },
              {
                key: 'status',
                label: 'Trạng thái',
                children: <StatusTag status={selectedSession.status} />,
              },
              {
                key: 'time',
                label: 'Thời gian mở điểm danh',
                children: `${formatDateTime(selectedSession.checkinOpenAt)} - ${formatDateTime(selectedSession.checkinCloseAt)}`,
              },
              {
                key: 'openedAt',
                label: 'Đã mở lúc',
                children: formatDateTime(selectedSession.openedAt),
              },
              {
                key: 'closedAt',
                label: 'Đã đóng lúc',
                children: formatDateTime(selectedSession.closedAt),
              },
              {
                key: 'attendance',
                label: 'Điểm danh',
                children: `${selectedSession.attendedCount}/${selectedSession.totalStudents} (${selectedSession.attendanceRate}%)`,
              },
            ]}
          />
        )}
      </ModalCustom>
    </div>
  );
};

export default AttendanceSessionPage;


