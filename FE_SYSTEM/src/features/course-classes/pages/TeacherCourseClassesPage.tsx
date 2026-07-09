import PageHeader from '@/shared/components/page/PageHeader';
import ModalCustom from '@/shared/components/modal/ModalCustom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Progress,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { teacherCourseClassApi } from '../api/teacher-course-class-api';
import type {
  EffectiveAttendanceStatus,
  TeacherAttendanceSession,
  TeacherAttendanceStudent,
  TeacherCourseClassItem,
  TeacherCourseSchedule,
  AttendanceSessionStatus,
} from '../types/teacher-course-class-type';

const { Text } = Typography;

type DetailStatusFilter = EffectiveAttendanceStatus | 'ALL';

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

const attendanceStatusLabel: Record<EffectiveAttendanceStatus, string> = {
  PRESENT: 'Đúng giờ',
  LATE: 'Đi trễ',
  ABSENT: 'Vắng',
  PENDING: 'Chưa điểm danh',
};

const attendanceStatusColor: Record<EffectiveAttendanceStatus, string> = {
  PRESENT: 'success',
  LATE: 'warning',
  ABSENT: 'error',
  PENDING: 'default',
};

function formatDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildCourseClassLabel(courseClass: TeacherCourseClassItem) {
  return `${courseClass.course_code} - ${courseClass.subject_name} (${courseClass.total_students} SV)`;
}

function buildScheduleRate(schedule: TeacherCourseSchedule) {
  const expected = schedule.sessions.reduce(
    (sum, session) => sum + session.totalStudents,
    0,
  );
  const attended = schedule.sessions.reduce(
    (sum, session) => sum + session.attended,
    0,
  );

  if (expected <= 0) return 0;

  return Math.round((attended / expected) * 100);
}

const SessionStatusTag = ({ status }: { status: AttendanceSessionStatus }) => (
  <Tag color={sessionStatusColor[status]}>{sessionStatusLabel[status]}</Tag>
);

const AttendanceStatusTag = ({
  status,
}: {
  status: EffectiveAttendanceStatus;
}) => <Tag color={attendanceStatusColor[status]}>{attendanceStatusLabel[status]}</Tag>;

const TeacherCourseClassesPage = () => {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>();
  const [selectedCourseClassId, setSelectedCourseClassId] = useState<number>();
  const [selectedAttendanceSessionId, setSelectedAttendanceSessionId] =
    useState<number>();
  const [detailStatusFilter, setDetailStatusFilter] =
    useState<DetailStatusFilter>('ALL');

  const {
    data: courseClasses = [],
    isLoading: loadingCourseClasses,
    isFetching: fetchingCourseClasses,
    isError: courseClassError,
    refetch: refetchCourseClasses,
  } = useQuery({
    queryKey: ['teacher-course-classes'],
    queryFn: teacherCourseClassApi.getMyCourseClasses,
  });

  const {
    data: scheduleData,
    isLoading: loadingSchedules,
    isFetching: fetchingSchedules,
    isError: scheduleError,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ['teacher-course-class-schedules', selectedCourseClassId],
    queryFn: () =>
      teacherCourseClassApi.getCourseClassSchedules(selectedCourseClassId!),
    enabled: selectedCourseClassId !== undefined,
  });

  const {
    data: detailData,
    isLoading: loadingDetail,
    isError: detailError,
  } = useQuery({
    queryKey: [
      'teacher-attendance-session-students',
      selectedAttendanceSessionId,
    ],
    queryFn: () =>
      teacherCourseClassApi.getAttendanceSessionStudents(
        selectedAttendanceSessionId!,
      ),
    enabled: selectedAttendanceSessionId !== undefined,
  });

  const subjectOptions = useMemo(() => {
    const subjects = new Map<
      string,
      { subjectCode: string; subjectName: string; totalClasses: number }
    >();

    for (const courseClass of courseClasses) {
      const current = subjects.get(courseClass.subject_code);

      if (current) {
        current.totalClasses++;
      } else {
        subjects.set(courseClass.subject_code, {
          subjectCode: courseClass.subject_code,
          subjectName: courseClass.subject_name,
          totalClasses: 1,
        });
      }
    }

    return Array.from(subjects.values()).map((subject) => ({
      value: subject.subjectCode,
      label: `${subject.subjectCode} - ${subject.subjectName} (${subject.totalClasses} lớp)`,
    }));
  }, [courseClasses]);

  const selectedCourseClassOptions = useMemo(
    () =>
      courseClasses
        .filter((courseClass) => courseClass.subject_code === selectedSubjectCode)
        .map((courseClass) => ({
          value: courseClass.id_course_class,
          label: buildCourseClassLabel(courseClass),
        })),
    [courseClasses, selectedSubjectCode],
  );

  const selectedClass = useMemo(
    () =>
      courseClasses.find(
        (courseClass) => courseClass.id_course_class === selectedCourseClassId,
      ),
    [courseClasses, selectedCourseClassId],
  );

  const filteredDetailStudents = useMemo(() => {
    const students = detailData?.students ?? [];

    if (detailStatusFilter === 'ALL') {
      return students;
    }

    return students.filter(
      (student) => student.effectiveAttendanceStatus === detailStatusFilter,
    );
  }, [detailData?.students, detailStatusFilter]);

  const handleRefresh = () => {
    refetchCourseClasses();

    if (selectedCourseClassId !== undefined) {
      refetchSchedules();
    }
  };

  const handleSubjectChange = (value?: string) => {
    setSelectedSubjectCode(value);
    setSelectedCourseClassId(undefined);
  };

  const handleCloseDetail = () => {
    setSelectedAttendanceSessionId(undefined);
    setDetailStatusFilter('ALL');
  };

  const sessionColumns: TableColumnsType<TeacherAttendanceSession> = [
    {
      title: 'Ngày học',
      dataIndex: 'sessionDate',
      width: 130,
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (status: AttendanceSessionStatus) => <SessionStatusTag status={status} />,
    },
    {
      title: 'Giờ điểm danh',
      width: 170,
      render: (_, record) =>
        `${formatTime(record.checkinOpenAt)} - ${formatTime(record.checkinCloseAt)}`,
    },
    {
      title: 'Đúng giờ',
      dataIndex: 'present',
      align: 'center',
      width: 100,
    },
    {
      title: 'Đi trễ',
      dataIndex: 'late',
      align: 'center',
      width: 90,
    },
    {
      title: 'Vắng',
      dataIndex: 'absent',
      align: 'center',
      width: 80,
    },
    {
      title: 'Chưa ĐD',
      dataIndex: 'pending',
      align: 'center',
      width: 90,
    },
    {
      title: 'Tỷ lệ',
      width: 140,
      render: (_, record) => <Progress percent={record.attendanceRate} size="small" />,
    },
    {
      title: 'Chi tiết',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => setSelectedAttendanceSessionId(record.idAttendanceSession)}
        >
          Xem
        </Button>
      ),
    },
  ];

  const scheduleColumns: TableColumnsType<TeacherCourseSchedule> = [
    {
      title: 'Thứ',
      dataIndex: 'dayOfWeekLabel',
      width: 110,
    },
    {
      title: 'Phòng',
      width: 100,
      render: (_, record) => record.room.roomCode,
    },
    {
      title: 'Ca học',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.shift}</div>
          <Text type="secondary" className="text-xs">
            {record.startShift.startTime} - {record.endShift.endTime}
          </Text>
        </div>
      ),
    },
    {
      title: 'Thời gian học',
      width: 230,
      render: (_, record) => `${formatDate(record.startDate)} - ${formatDate(record.endDate)}`,
    },
    {
      title: 'Phiên điểm danh',
      align: 'center',
      width: 140,
      render: (_, record) => record.sessions.length,
    },
    {
      title: 'Tỷ lệ điểm danh',
      width: 180,
      render: (_, record) => <Progress percent={buildScheduleRate(record)} size="small" />,
    },
  ];

  const detailColumns: TableColumnsType<TeacherAttendanceStudent> = [
    {
      title: 'MSSV',
      dataIndex: 'studentCode',
      width: 120,
      render: (value: string) => <Text code>{value}</Text>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      ellipsis: true,
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'effectiveAttendanceStatus',
      width: 150,
      align: 'center',
      render: (status: EffectiveAttendanceStatus) => (
        <AttendanceStatusTag status={status} />
      ),
    },
    {
      title: 'Ngày giờ điểm danh',
      dataIndex: 'checkinTime',
      width: 170,
      render: (value: string | null) => formatDateTime(value),
    },
    {
      title: 'Độ tin cậy',
      dataIndex: 'confidence',
      width: 120,
      align: 'center',
      render: (value: number | null) =>
        value === null || value === undefined ? '-' : `${value.toFixed(1)}%`,
    },
    {
      title: 'Kiosk',
      width: 160,
      render: (_, record) => record.kiosk?.deviceName ?? '-',
    },
  ];

  const renderSessions = (schedule: TeacherCourseSchedule) => {
    if (schedule.sessions.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có phiên điểm danh" />;
    }

    return (
      <Table<TeacherAttendanceSession>
        rowKey="idAttendanceSession"
        columns={sessionColumns}
        dataSource={schedule.sessions}
        pagination={false}
        size="small"
        scroll={{ x: 1040 }}
      />
    );
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Lớp học phần"
        subtitle="Xem lịch học và chi tiết điểm danh theo lớp học phần được phân công"
        extra={
          <Button icon={<ReloadOutlined />} loading={fetchingCourseClasses || fetchingSchedules} onClick={handleRefresh}>
            Làm mới
          </Button>
        }
      />

      {courseClassError && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải danh sách lớp học phần"
          description="Vui lòng kiểm tra kết nối hoặc thử làm mới lại trang."
        />
      )}

      <Card className="shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Text strong>Môn học</Text>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              className="mt-2 w-full"
              placeholder="Chọn môn học"
              loading={loadingCourseClasses}
              value={selectedSubjectCode}
              options={subjectOptions}
              onChange={handleSubjectChange}
              onClear={() => handleSubjectChange(undefined)}
            />
          </Col>
          <Col xs={24} lg={12}>
            <Text strong>Lớp học phần</Text>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              className="mt-2 w-full"
              placeholder="Chọn lớp học phần"
              disabled={!selectedSubjectCode}
              value={selectedCourseClassId}
              options={selectedCourseClassOptions}
              onChange={(value?: number) => setSelectedCourseClassId(value)}
              onClear={() => setSelectedCourseClassId(undefined)}
            />
          </Col>
        </Row>
      </Card>

      {selectedClass && (
        <Alert
          type="info"
          showIcon
          message={`${selectedClass.subject_name} - ${selectedClass.course_code}`}
          description={`Mã môn: ${selectedClass.subject_code}. Sĩ số: ${selectedClass.total_students} sinh viên.`}
        />
      )}

      {selectedCourseClassId === undefined ? (
        <Card className="flex-1 shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chọn môn học và lớp học phần để xem lịch học"
          />
        </Card>
      ) : scheduleError ? (
        <Alert
          type="error"
          showIcon
          message="Không thể tải lịch học"
          description="Lớp học phần này có thể không thuộc quyền truy cập của bạn hoặc backend đang lỗi."
        />
      ) : loadingSchedules ? (
        <Card className="shadow-sm">
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : scheduleData ? (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={12} lg={6}>
              <Card className="h-full shadow-sm">
                <Statistic title="Lịch học" value={scheduleData.summary.totalSchedules} prefix={<CalendarOutlined />} />
              </Card>
            </Col>
            <Col xs={12} lg={6}>
              <Card className="h-full shadow-sm">
                <Statistic title="Phiên điểm danh" value={scheduleData.summary.totalSessions} prefix={<ClockCircleOutlined />} />
              </Card>
            </Col>
            <Col xs={12} lg={6}>
              <Card className="h-full shadow-sm">
                <Statistic title="Sĩ số" value={scheduleData.summary.totalStudents} prefix={<TeamOutlined />} />
              </Card>
            </Col>
            <Col xs={12} lg={6}>
              <Card className="h-full shadow-sm">
                <Statistic title="Tỷ lệ trung bình" value={`${scheduleData.summary.averageAttendanceRate}%`} prefix={<BookOutlined />} />
              </Card>
            </Col>
          </Row>

          <Card title="Danh sách lịch học" className="flex-1 shadow-sm">
            <Table<TeacherCourseSchedule>
              rowKey="idCourseSchedule"
              columns={scheduleColumns}
              dataSource={scheduleData.schedules}
              pagination={false}
              scroll={{ x: 930 }}
              expandable={{
                expandedRowRender: renderSessions,
                rowExpandable: () => true,
              }}
              locale={{
                emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Lớp học phần chưa có lịch học" />,
              }}
            />
          </Card>
        </>
      ) : null}

      <ModalCustom
        open={selectedAttendanceSessionId !== undefined}
        title="Chi tiết điểm danh"
        width={1120}
        onCancel={handleCloseDetail}
      >
        {loadingDetail ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : detailError ? (
          <Alert
            type="error"
            showIcon
            message="Không thể tải chi tiết điểm danh"
            description="Vui lòng thử đóng và mở lại chi tiết phiên."
          />
        ) : detailData ? (
          <div className="flex flex-col gap-4">
            <Descriptions
              bordered
              size="small"
              column={{ xs: 1, md: 2 }}
              items={[
                {
                  key: 'courseClass',
                  label: 'Lớp học phần',
                  children: `${detailData.session.courseClass.courseCode} - ${detailData.session.courseClass.subjectName}`,
                },
                {
                  key: 'sessionDate',
                  label: 'Ngày học',
                  children: `${detailData.session.dayOfWeekLabel}, ${formatDate(detailData.session.sessionDate)}`,
                },
                {
                  key: 'room',
                  label: 'Phòng',
                  children: detailData.session.room.roomCode,
                },
                {
                  key: 'shift',
                  label: 'Ca học',
                  children: `${detailData.session.shift} (${detailData.session.startShift.startTime} - ${detailData.session.endShift.endTime})`,
                },
                {
                  key: 'checkinTime',
                  label: 'Giờ mở điểm danh',
                  children: `${formatTime(detailData.session.checkinOpenAt)} - ${formatTime(detailData.session.checkinCloseAt)}`,
                },
                {
                  key: 'status',
                  label: 'Trạng thái phiên',
                  children: <SessionStatusTag status={detailData.session.status} />,
                },
              ]}
            />

            <Row gutter={[12, 12]}>
              <Col xs={12} md={6}>
                <Card size="small">
                  <Statistic title="Đúng giờ" value={detailData.summary.present} valueStyle={{ color: '#52c41a' }} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card size="small">
                  <Statistic title="Đi trễ" value={detailData.summary.late} valueStyle={{ color: '#faad14' }} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card size="small">
                  <Statistic title="Vắng" value={detailData.summary.absent} valueStyle={{ color: '#ff4d4f' }} />
                </Card>
              </Col>
              <Col xs={12} md={6}>
                <Card size="small">
                  <Statistic title="Chưa điểm danh" value={detailData.summary.pending} />
                </Card>
              </Col>
            </Row>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Segmented
                value={detailStatusFilter}
                onChange={(value) => setDetailStatusFilter(value as DetailStatusFilter)}
                options={[
                  { label: `Tất cả (${detailData.summary.totalStudents})`, value: 'ALL' },
                  { label: `Đúng giờ (${detailData.summary.present})`, value: 'PRESENT' },
                  { label: `Đi trễ (${detailData.summary.late})`, value: 'LATE' },
                  { label: `Vắng (${detailData.summary.absent})`, value: 'ABSENT' },
                  { label: `Chưa ĐD (${detailData.summary.pending})`, value: 'PENDING' },
                ]}
              />

              <Space>
                <Text type="secondary">Tỷ lệ điểm danh</Text>
                <Progress
                  percent={detailData.summary.attendanceRate}
                  size="small"
                  style={{ width: 140 }}
                />
              </Space>
            </div>

            <Table<TeacherAttendanceStudent>
              rowKey="idStudent"
              columns={detailColumns}
              dataSource={filteredDetailStudents}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 980, y: 360 }}
              size="middle"
            />
          </div>
        ) : null}
      </ModalCustom>
    </div>
  );
};

export default TeacherCourseClassesPage;
