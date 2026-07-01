import { getDashboardData } from '@/features/dashboard/api/dashboard-api';
import type {
  TeacherDashboardData,
  TeacherTodaySession,
  FaceRegistrationByClass,
  UnregisteredStudent,
} from '@/features/dashboard/types/teacherDashboardType';
import type {
  AttendanceSessionStatus,
  DashboardTone,
} from '@/features/dashboard/types/dashboardType';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Grid,
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
  ArrowRightOutlined,
  CameraOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

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

function formatTime(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const StatCards = ({ data }: { data: TeacherDashboardData }) => (
  <Row gutter={[12, 12]}>
    {data.statData.map((item) => (
      <Col xs={12} md={12} xl={6} key={item.key}>
        <Card className="h-full shadow-sm" styles={{ body: { minHeight: 112, padding: 16 } }}>
          <Statistic
            title={item.title}
            value={item.value}
            valueStyle={{ color: toneColor[item.tone], fontWeight: 700, fontSize: 24 }}
          />
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 md:text-sm">{item.extra}</div>
        </Card>
      </Col>
    ))}
  </Row>
);

const AttendanceOverview = ({ data }: { data: TeacherDashboardData }) => (
  <Card title="Tổng quan điểm danh hôm nay" className="h-full shadow-sm">
    {data.todaySessions.length > 0 ? (
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Tỷ lệ đã điểm danh</span>
            <span className="font-semibold">{data.attendanceSummary.attendanceRate}%</span>
          </div>
          <Progress percent={data.attendanceSummary.attendanceRate} strokeColor="#52c41a" />
        </div>

        <Row gutter={[12, 12]}>
          <Col span={8}>
            <Statistic
              title="Có mặt"
              value={data.attendanceSummary.present}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Đi trễ"
              value={data.attendanceSummary.late}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Vắng"
              value={data.attendanceSummary.absent}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
      </div>
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Hôm nay không có buổi điểm danh" />
    )}
  </Card>
);

const FaceRegistrationProgressList = ({ data }: { data: FaceRegistrationByClass[] }) => (
  <div className="flex flex-col gap-2">
    {data.map((record) => (
      <div key={record.courseCode} className="rounded-md border border-gray-100 dark:border-gray-800 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-medium">{record.courseCode}</div>
            <div className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{record.subjectName}</div>
          </div>
          <Text
            style={{
              color: record.rate === 100 ? '#52c41a' : '#1677ff',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {record.registered}/{record.total}
          </Text>
        </div>
        <Progress
          percent={record.rate}
          size="small"
          strokeColor={record.rate === 100 ? '#52c41a' : '#1677ff'}
        />
      </div>
    ))}
  </div>
);

const FaceRegistrationOverview = ({
  data,
  compact,
  onNavigate,
}: {
  data: TeacherDashboardData;
  compact: boolean;
  onNavigate: () => void;
}) => (
  <Card
    title="Tổng quan đăng ký khuôn mặt"
    className="h-full shadow-sm"
    extra={
      !compact ? (
        <Button type="primary" icon={<CameraOutlined />} onClick={onNavigate}>
          Đi đăng ký
        </Button>
      ) : null
    }
  >
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Tỷ lệ đã đăng ký</span>
          <span className="font-semibold">{data.faceRegistrationSummary.rate}%</span>
        </div>
        <Progress
          percent={data.faceRegistrationSummary.rate}
          strokeColor={data.faceRegistrationSummary.rate === 100 ? '#52c41a' : '#1677ff'}
        />
      </div>

      <Row gutter={[12, 12]}>
        <Col span={12}>
          <Statistic
            title="Đã đăng ký"
            value={data.faceRegistrationSummary.registered}
            valueStyle={{ color: '#52c41a' }}
            suffix={<span style={{ fontSize: 14, color: '#8c8c8c' }}>/{data.faceRegistrationSummary.totalStudents}</span>}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Chưa đăng ký"
            value={data.faceRegistrationSummary.notRegistered}
            valueStyle={{
              color: data.faceRegistrationSummary.notRegistered > 0 ? '#faad14' : '#52c41a',
            }}
          />
        </Col>
      </Row>

      {compact && (
        <Button block type="primary" icon={<CameraOutlined />} onClick={onNavigate}>
          Đi đăng ký khuôn mặt
        </Button>
      )}

      {data.faceRegistrationSummary.byClass.length > 0 && (
        <div>
          <Text type="secondary" style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
            Theo lớp học phần
          </Text>
          {compact ? (
            <FaceRegistrationProgressList data={data.faceRegistrationSummary.byClass} />
          ) : (
            <Table<FaceRegistrationByClass>
              rowKey="courseCode"
              dataSource={data.faceRegistrationSummary.byClass}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Lớp',
                  render: (_, record) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{record.courseCode}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.subjectName}</div>
                    </div>
                  ),
                },
                {
                  title: 'Tiến độ',
                  width: 100,
                  align: 'center' as const,
                  render: (_, record) => (
                    <Text
                      style={{
                        color: record.rate === 100 ? '#52c41a' : '#1677ff',
                        fontWeight: 600,
                      }}
                    >
                      {record.registered}/{record.total}
                    </Text>
                  ),
                },
                {
                  title: '',
                  width: 120,
                  render: (_, record) => (
                    <Progress
                      percent={record.rate}
                      size="small"
                      strokeColor={record.rate === 100 ? '#52c41a' : '#1677ff'}
                      showInfo={false}
                    />
                  ),
                },
              ]}
            />
          )}
        </div>
      )}
    </div>
  </Card>
);

const SessionCardList = ({ data }: { data: TeacherTodaySession[] }) => {
  if (data.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Hôm nay không có buổi điểm danh nào" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((record) => (
        <div key={record.id} className="rounded-md border border-gray-100 dark:border-gray-800 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold">{record.subjectName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{record.courseCode}</div>
            </div>
            <Tag color={sessionStatusColor[record.status]}>{sessionStatusLabel[record.status]}</Tag>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Phòng</div>
              <div className="font-medium">{record.roomCode}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Ca học</div>
              <div className="font-medium">{record.shift}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(record.checkinOpenAt)} - {formatTime(record.checkinCloseAt)}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Điểm danh</span>
              <span className="font-semibold">
                {record.attendedCount}/{record.totalStudents}
              </span>
            </div>
            <Progress percent={record.attendanceRate} size="small" />
          </div>
        </div>
      ))}
    </div>
  );
};

const SessionTable = ({ data, compact }: { data: TeacherTodaySession[]; compact: boolean }) => (
  <Card title="Buổi điểm danh hôm nay" className="shadow-sm">
    {compact ? (
      <SessionCardList data={data} />
    ) : (
      <Table<TeacherTodaySession>
        rowKey="id"
        dataSource={data}
        pagination={false}
        scroll={{ x: 720 }}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Hôm nay không có buổi điểm danh nào" />,
        }}
        columns={[
          {
            title: 'Môn học',
            render: (_, record) => (
              <div>
                <div className="font-semibold">{record.subjectName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{record.courseCode}</div>
              </div>
            ),
          },
          {
            title: 'Phòng',
            dataIndex: 'roomCode',
            width: 100,
          },
          {
            title: 'Ca học',
            render: (_, record) => (
              <div>
                <div>{record.shift}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(record.checkinOpenAt)} - {formatTime(record.checkinCloseAt)}
                </div>
              </div>
            ),
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center' as const,
            width: 130,
            render: (status: AttendanceSessionStatus) => <Tag color={sessionStatusColor[status]}>{sessionStatusLabel[status]}</Tag>,
          },
          {
            title: 'Điểm danh',
            align: 'center' as const,
            width: 110,
            render: (_, record) => `${record.attendedCount}/${record.totalStudents}`,
          },
          {
            title: 'Tỷ lệ',
            width: 140,
            render: (_, record) => <Progress percent={record.attendanceRate} size="small" />,
          },
        ]}
      />
    )}
  </Card>
);

const UnregisteredStudentList = ({ data }: { data: UnregisteredStudent[] }) => {
  if (data.length === 0) {
    return (
      <div className="py-6 text-center">
        <CheckCircleFilled style={{ fontSize: 36, color: '#52c41a', marginBottom: 8 }} />
        <div>
          <Text type="secondary">Tất cả sinh viên đã đăng ký khuôn mặt</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((record) => (
        <div key={`${record.id_student}-${record.course_code}`} className="rounded-md border border-gray-100 dark:border-gray-800 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Text code>{record.student_code}</Text>
              <div className="mt-1 font-medium">{record.full_name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Lớp: {record.class}</div>
            </div>
            <Tag icon={<CloseCircleFilled />} color="default">
              Chưa ĐK
            </Tag>
          </div>
          <div className="mt-3 rounded bg-gray-50 dark:bg-[#1f1f1f] p-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="font-medium text-gray-700 dark:text-gray-200">{record.course_code}</div>
            <div>{record.subject_name}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const UnregisteredStudentsTable = ({
  data,
  compact,
  onNavigate,
}: {
  data: UnregisteredStudent[];
  compact: boolean;
  onNavigate: () => void;
}) => (
  <Card
    title="Sinh viên chưa đăng ký khuôn mặt"
    className="shadow-sm"
    extra={
      data.length > 0 ? (
        <Button type="link" onClick={onNavigate} icon={<ArrowRightOutlined />} iconPosition="end">
          Xem tất cả
        </Button>
      ) : null
    }
  >
    {compact ? (
      <UnregisteredStudentList data={data} />
    ) : (
      <Table<UnregisteredStudent>
        rowKey="id_student"
        dataSource={data}
        pagination={false}
        size="small"
        locale={{
          emptyText: (
            <div style={{ padding: '24px 0' }}>
              <CheckCircleFilled style={{ fontSize: 36, color: '#52c41a', marginBottom: 8 }} />
              <div>
                <Text type="secondary">Tất cả sinh viên đã đăng ký khuôn mặt</Text>
              </div>
            </div>
          ),
        }}
        columns={[
          {
            title: 'MSSV',
            dataIndex: 'student_code',
            width: 120,
            render: (value: string) => <Text code>{value}</Text>,
          },
          {
            title: 'Họ tên',
            dataIndex: 'full_name',
            ellipsis: true,
          },
          {
            title: 'Lớp',
            dataIndex: 'class',
            width: 120,
          },
          {
            title: 'Lớp HP',
            render: (_, record) => (
              <div>
                <div style={{ fontSize: 13 }}>{record.course_code}</div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.subject_name}</div>
              </div>
            ),
          },
          {
            title: '',
            width: 80,
            align: 'center' as const,
            render: () => (
              <Tag icon={<CloseCircleFilled />} color="default">
                Chưa ĐK
              </Tag>
            ),
          },
        ]}
      />
    )}
  </Card>
);

export default function TeacherDashBoard() {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const compact = !screens.lg;
  const { data, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: getDashboardData.getTeacherDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 md:gap-6">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Row gutter={[12, 12]}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Col xs={12} md={12} xl={6} key={index}>
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
        description="Vui lòng kiểm tra kết nối và thử tải lại trang."
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-3 rounded-lg bg-white dark:bg-[#141414] p-4 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">Xin chào, {data.teacher.fullName}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 md:text-base">
            Tổng quan ngày {data.today} - Mã GV: {data.teacher.teacherCode}
          </p>
        </div>

        <Space wrap className="w-full md:w-auto">
          <Button block={compact} icon={<CameraOutlined />} onClick={() => navigate('/face-enrollment')}>
            Đăng ký khuôn mặt
          </Button>
          <Button block={compact} type="primary" icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
            Làm mới
          </Button>
        </Space>
      </div>

      <StatCards data={data} />

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={12}>
          <AttendanceOverview data={data} />
        </Col>
        <Col xs={24} xl={12}>
          <FaceRegistrationOverview data={data} compact={compact} onNavigate={() => navigate('/face-enrollment')} />
        </Col>
      </Row>

      <SessionTable data={data.todaySessions} compact={compact} />

      <UnregisteredStudentsTable
        data={data.unregisteredStudents}
        compact={compact}
        onNavigate={() => navigate('/face-enrollment')}
      />
    </div>
  );
}
