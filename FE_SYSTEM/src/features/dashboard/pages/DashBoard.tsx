import { getDashboardData } from '@/features/dashboard/api/dashboard-api';
import type {
  AttendanceSessionStatus,
  DashboardAlertSeverity,
  DashboardDataType,
  DashboardRecentActivity,
  DashboardTodaySession,
  DashboardTone,
  KioskHealthItem,
  KioskStatus,
  RecentActivityType,
} from '@/features/dashboard/types/dashboardType';
import PageHeader from '@/shared/components/page/PageHeader';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  List,
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
  CheckCircleOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const { getDashboard } = getDashboardData;

const toneColor: Record<DashboardTone, string> = {
  blue: '#1677ff',
  green: '#52c41a',
  red: '#ff4d4f',
  gold: '#faad14',
  cyan: '#13c2c2',
};

const sessionStatusLabel: Record<AttendanceSessionStatus, string> = {
  NOT_STARTED: 'Chưa bắt đầu',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
};

const sessionStatusColor: Record<AttendanceSessionStatus, string> = {
  NOT_STARTED: 'default',
  OPEN: 'processing',
  CLOSED: 'success',
};

const kioskStatusLabel: Record<KioskStatus, string> = {
  PENDING: 'Chờ kích hoạt',
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngưng hoạt động',
  BLOCKED: 'Bị khóa',
};

const kioskStatusColor: Record<KioskStatus, string> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'default',
  BLOCKED: 'error',
};

const alertTypeMap: Record<DashboardAlertSeverity, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warning: 'warning',
  error: 'error',
};

const activityIcon: Record<RecentActivityType, React.ReactNode> = {
  ATTENDANCE: <CheckCircleOutlined className="text-green-500" />,
  KIOSK: <DesktopOutlined className="text-blue-500" />,
  SYNC: <DatabaseOutlined className="text-purple-500" />,
};

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

const StatCards = ({ data }: { data: DashboardDataType }) => (
  <Row gutter={[16, 16]}>
    {data.statData.map((item) => (
      <Col xs={24} sm={12} xl={6} key={item.key}>
        <Card className="h-full shadow-sm" styles={{ body: { minHeight: 132 } }}>
          <Statistic
            title={item.title}
            value={item.value}
            valueStyle={{ color: toneColor[item.tone], fontWeight: 700 }}
          />
          <div className="mt-3 text-sm text-gray-500">{item.extra}</div>
        </Card>
      </Col>
    ))}
  </Row>
);

const AttendanceOverview = ({ data }: { data: DashboardDataType }) => (
  <Card title="Tổng quan điểm danh hôm nay" className="h-full shadow-sm">
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">Tỷ lệ đã điểm danh</span>
          <span className="font-semibold">{data.attendanceSummary.attendanceRate}%</span>
        </div>
        <Progress percent={data.attendanceSummary.attendanceRate} strokeColor="#52c41a" />
      </div>

      <Row gutter={[12, 12]}>
        <Col span={8}>
          <Statistic title="Có mặt" value={data.attendanceSummary.present} valueStyle={{ color: '#52c41a' }} />
        </Col>
        <Col span={8}>
          <Statistic title="Đi trễ" value={data.attendanceSummary.late} valueStyle={{ color: '#faad14' }} />
        </Col>
        <Col span={8}>
          <Statistic title="Vắng" value={data.attendanceSummary.absent} valueStyle={{ color: '#ff4d4f' }} />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col span={8}>
          <Tag color="processing">Đang mở: {data.sessionStatusSummary.open}</Tag>
        </Col>
        <Col span={8}>
          <Tag>Chưa bắt đầu: {data.sessionStatusSummary.notStarted}</Tag>
        </Col>
        <Col span={8}>
          <Tag color="success">Đã đóng: {data.sessionStatusSummary.closed}</Tag>
        </Col>
      </Row>
    </div>
  </Card>
);

const KioskOverview = ({ data }: { data: DashboardDataType }) => (
  <Card title="Sức khỏe Kiosk" className="h-full shadow-sm">
    <div className="flex flex-col gap-5">
      <Row gutter={[12, 12]}>
        <Col span={12}>
          <Statistic title="Online" value={data.kioskHealth.online} valueStyle={{ color: '#52c41a' }} />
        </Col>
        <Col span={12}>
          <Statistic title="Offline" value={data.kioskHealth.offline} valueStyle={{ color: '#ff4d4f' }} />
        </Col>
      </Row>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">Thiết bị đang hoạt động</span>
          <span className="font-semibold">
            {data.kioskHealth.active}/{data.kioskHealth.total}
          </span>
        </div>
        <Progress
          percent={data.kioskHealth.total ? Math.round((data.kioskHealth.active / data.kioskHealth.total) * 100) : 0}
          strokeColor="#1677ff"
        />
      </div>

      <Space wrap>
        <Tag color="warning">Chờ kích hoạt: {data.kioskHealth.pending}</Tag>
        <Tag>Ngưng: {data.kioskHealth.inactive}</Tag>
        <Tag color="error">Khóa: {data.kioskHealth.blocked}</Tag>
      </Space>
    </div>
  </Card>
);

const SessionTable = ({ data }: { data: DashboardTodaySession[] }) => (
  <Card title="Buổi điểm danh hôm nay" className="shadow-sm">
    <Table<DashboardTodaySession>
      rowKey="id"
      dataSource={data}
      pagination={false}
      scroll={{ x: 900 }}
      columns={[
        {
          title: 'Môn học',
          render: (_, record) => (
            <div>
              <div className="font-semibold">{record.subjectName}</div>
              <div className="text-xs text-gray-500">{record.courseCode}</div>
            </div>
          ),
        },
        {
          title: 'Phòng',
          dataIndex: 'roomCode',
          width: 110,
        },
        {
          title: 'Ca học',
          render: (_, record) => (
            <div>
              <div>{record.shift}</div>
              <div className="text-xs text-gray-500">
                {formatTime(record.checkinOpenAt)} - {formatTime(record.checkinCloseAt)}
              </div>
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
          render: (status: AttendanceSessionStatus) => (
            <Tag color={sessionStatusColor[status]}>{sessionStatusLabel[status]}</Tag>
          ),
        },
        {
          title: 'Điểm danh',
          align: 'center' as const,
          render: (_, record) => `${record.attendedCount}/${record.totalStudents}`,
        },
        {
          title: 'Tỷ lệ',
          width: 150,
          render: (_, record) => <Progress percent={record.attendanceRate} size="small" />,
        },
      ]}
    />
  </Card>
);

const KioskTable = ({ data }: { data: KioskHealthItem[] }) => (
  <Card title="Thiết bị cần theo dõi" className="shadow-sm">
    <Table<KioskHealthItem>
      rowKey="id"
      dataSource={data}
      pagination={false}
      scroll={{ x: 720 }}
      columns={[
        {
          title: 'Thiết bị',
          render: (_, record) => (
            <div>
              <div className="font-semibold">{record.deviceName}</div>
              <Typography.Text code>{record.deviceCode}</Typography.Text>
            </div>
          ),
        },
        {
          title: 'Phòng',
          dataIndex: 'roomCode',
          width: 100,
        },
        {
          title: 'Trạng thái',
          dataIndex: 'status',
          align: 'center' as const,
          render: (status: KioskStatus) => <Tag color={kioskStatusColor[status]}>{kioskStatusLabel[status]}</Tag>,
        },
        {
          title: 'Kết nối',
          align: 'center' as const,
          render: (_, record) => <Tag color={record.online ? 'success' : 'error'}>{record.online ? 'Online' : 'Offline'}</Tag>,
        },
        {
          title: 'Lần cuối online',
          dataIndex: 'lastSeenAt',
          render: (value: string | null) => formatDateTime(value),
        },
      ]}
    />
  </Card>
);

const AlertsPanel = ({ data }: { data: DashboardDataType }) => (
  <Card title="Cảnh báo cần xử lý" className="h-full shadow-sm">
    <div className="flex flex-col gap-3">
      {data.alerts.length > 0 ? (
        data.alerts.map((item) => (
          <Alert
            key={item.key}
            type={alertTypeMap[item.severity]}
            showIcon
            message={item.title}
            description={item.message}
          />
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có cảnh báo" />
      )}
    </div>
  </Card>
);

const ActivityPanel = ({ data }: { data: DashboardRecentActivity[] }) => (
  <Card title="Hoạt động gần đây" className="h-full shadow-sm">
    <List
      dataSource={data}
      locale={{ emptyText: 'Không có hoạt động gần đây' }}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={activityIcon[item.type]}
            title={
              <div className="flex items-center justify-between gap-3">
                <span>{item.title}</span>
                <Tag>{item.meta}</Tag>
              </div>
            }
            description={
              <div>
                <div>{item.message}</div>
                <div className="text-xs text-gray-400">{formatDateTime(item.date)}</div>
              </div>
            }
          />
        </List.Item>
      )}
    />
  </Card>
);

const NotesPanel = ({ data }: { data: DashboardDataType }) => (
  <Card title="Ghi chú dữ liệu" className="shadow-sm">
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Space direction="vertical" size={2}>
          <Typography.Text type="secondary">Lần cập nhật dashboard</Typography.Text>
          <Typography.Text strong>{formatDateTime(data.generatedAt)}</Typography.Text>
        </Space>
      </Col>
      <Col xs={24} lg={8}>
        <Space direction="vertical" size={2}>
          <Typography.Text type="secondary">Đồng bộ gần nhất</Typography.Text>
          <Typography.Text strong>{data.sync ? formatDateTime(data.sync.latestSyncedAt) : 'Chưa có dữ liệu'}</Typography.Text>
        </Space>
      </Col>
      <Col xs={24} lg={8}>
        <Space direction="vertical" size={2}>
          {data.notes.map((note) => (
            <Typography.Text key={note} type="secondary">
              {note}
            </Typography.Text>
          ))}
        </Space>
      </Col>
    </Row>
  </Card>
);

export default function DashBoardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Row gutter={[16, 16]}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Col xs={24} sm={12} xl={6} key={index}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert
        type="error"
        showIcon
        message="Không thể tải dashboard"
        description="Vui lòng kiểm tra backend hoặc thử tải lại trang."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard quản trị"
        subtitle={`Tổng quan vận hành ngày ${data.today}`}
        extra={
          <Space wrap>
            <Button icon={<DesktopOutlined />} onClick={() => navigate('/kiosks')}>
              Kiosk
            </Button>
            <Button type="primary" icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
              Làm mới
            </Button>
          </Space>
        }
      />

      <StatCards data={data} />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <AttendanceOverview data={data} />
        </Col>
        <Col xs={24} xl={12}>
          <KioskOverview data={data} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <SessionTable data={data.todaySessions} />
        </Col>
        <Col xs={24} xl={8}>
          <AlertsPanel data={data} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <KioskTable data={data.kioskHealth.items} />
        </Col>
        <Col xs={24} xl={10}>
          <ActivityPanel data={data.recentActivities} />
        </Col>
      </Row>

      <NotesPanel data={data} />
    </div>
  );
}


