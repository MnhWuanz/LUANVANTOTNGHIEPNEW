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
  Form,
  Input,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceSessionApi } from '../api/attendance-session-api';
import type {
  AttendanceSession,
  AttendanceSessionStatus,
  CheckConflictsData,
  CourseScheduleItem,
} from '../types/attendance-session-type';

const statusLabel: Record<AttendanceSessionStatus, string> = {
  NOT_STARTED: 'Chưa bắt đầu',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
  CANCELLED: 'Đã hủy',
};

const statusColor: Record<AttendanceSessionStatus, string> = {
  NOT_STARTED: 'default',
  OPEN: 'processing',
  CLOSED: 'success',
  CANCELLED: 'error',
};

const dayOfWeekLabel: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
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

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message;
  }

  return undefined;
}

function buildSummary(sessions: AttendanceSession[]) {
  const total = sessions.length;
  const open = sessions.filter((item) => item.status === 'OPEN').length;
  const notStarted = sessions.filter((item) => item.status === 'NOT_STARTED').length;
  const closed = sessions.filter((item) => item.status === 'CLOSED').length;
  const cancelled = sessions.filter((item) => item.status === 'CANCELLED').length;
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
    cancelled,
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
  const [cancelSession, setCancelSession] = useState<AttendanceSession | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualScheduleId, setManualScheduleId] = useState<number>();
  const [manualDate, setManualDate] = useState<string>();
  const [conflictData, setConflictData] = useState<CheckConflictsData | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const [cancelForm] = Form.useForm<{ reason: string }>();
  const [manualForm] = Form.useForm<{ reason: string }>();

  const { data, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ['attendance-sessions', selectedDate],
    queryFn: () => attendanceSessionApi.getAll(selectedDate),
  });

  const { data: schedulesData } = useQuery({
    queryKey: ['all-course-schedules'],
    queryFn: attendanceSessionApi.getAllCourseSchedules,
    enabled: showManualModal,
  });

  const generateMutation = useMutation({
    mutationFn: attendanceSessionApi.generateToday,
    onSuccess: (res) => {
      showNotification('success', 'Tạo buổi điểm danh', res.message);
      setSelectedDate(res.data.date);
      refetch();
    },
    onError: (error: unknown) => {
      showNotification('error', 'Tạo buổi điểm danh thất bại', getErrorMessage(error) || 'Đã có lỗi xảy ra');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (params: { id: number; reason: string }) =>
      attendanceSessionApi.cancelSession(params.id, params.reason),
    onSuccess: () => {
      showNotification('success', 'Hủy phiên điểm danh', 'Hủy phiên điểm danh thành công');
      setCancelSession(null);
      cancelForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] });
    },
    onError: (error: unknown) => {
      showNotification('error', 'Hủy phiên thất bại', getErrorMessage(error) || 'Đã có lỗi xảy ra');
    },
  });

  const createManualMutation = useMutation({
    mutationFn: attendanceSessionApi.createManualSession,
    onSuccess: () => {
      showNotification('success', 'Tạo phiên bù', 'Tạo phiên điểm danh bù thành công');
      setShowManualModal(false);
      setManualScheduleId(undefined);
      setManualDate(undefined);
      setConflictData(null);
      manualForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] });
    },
    onError: (error: unknown) => {
      showNotification('error', 'Tạo phiên bù thất bại', getErrorMessage(error) || 'Đã có lỗi xảy ra');
    },
  });

  const sessions = useMemo(() => data?.data.sessions ?? [], [data?.data.sessions]);
  const summary = useMemo(() => buildSummary(sessions), [sessions]);

  const scheduleOptions = useMemo(() => {
    if (!schedulesData?.data) return [];

    return schedulesData.data.map((s: CourseScheduleItem) => ({
      value: s.idCourseSchedule,
      label: `${s.courseCode} - ${s.subjectName} | ${dayOfWeekLabel[s.dayOfWeek] ?? `Thứ ${s.dayOfWeek}`} | ${s.room} | ${s.shift}`,
      schedule: s,
    }));
  }, [schedulesData]);

  const doCheckConflicts = async (scheduleId: number, date: string) => {
    setCheckingConflict(true);
    try {
      const res = await attendanceSessionApi.checkConflicts({
        idCourseSchedule: scheduleId,
        sessionDate: date,
      });
      setConflictData(res.data);
    } catch {
      setConflictData(null);
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleManualScheduleChange = (value: number | undefined) => {
    setManualScheduleId(value);
    if (value && manualDate) {
      doCheckConflicts(value, manualDate);
    } else {
      setConflictData(null);
    }
  };

  const handleManualDateChange = (dateStr: string | undefined) => {
    setManualDate(dateStr);
    if (manualScheduleId && dateStr) {
      doCheckConflicts(manualScheduleId, dateStr);
    } else {
      setConflictData(null);
    }
  };

  const handleCancelSubmit = async () => {
    const values = await cancelForm.validateFields();
    if (!cancelSession) return;
    cancelMutation.mutate({ id: cancelSession.idAttendanceSession, reason: values.reason });
  };

  const handleManualSubmit = async () => {
    if (!manualScheduleId || !manualDate) return;
    const values = await manualForm.validateFields().catch(() => ({ reason: '' }));
    createManualMutation.mutate({
      idCourseSchedule: manualScheduleId,
      sessionDate: manualDate,
      reason: values.reason?.trim() || undefined,
    });
  };

  const handleCloseManualModal = () => {
    setShowManualModal(false);
    setManualScheduleId(undefined);
    setManualDate(undefined);
    setConflictData(null);
    manualForm.resetFields();
  };

  const columns = [
    {
      title: 'Môn học',
      render: (_: unknown, record: AttendanceSession) => (
        <div>
          <div className="font-semibold">
            {record.subjectName}
            {record.isManual && (
              <Tag color="purple" className="ml-2" style={{ fontSize: 10 }}>Dạy bù</Tag>
            )}
          </div>
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
      render: (status: AttendanceSessionStatus, record: AttendanceSession) => (
        <Space direction="vertical" size={2} style={{ alignItems: 'center' }}>
          <StatusTag status={status} />
          {status === 'CANCELLED' && record.cancelReason && (
            <Tooltip title={record.cancelReason}>
              <Typography.Text type="secondary" className="text-xs" style={{ cursor: 'pointer' }}>
                Xem lý do
              </Typography.Text>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Điểm danh',
      align: 'center' as const,
      render: (_: unknown, record: AttendanceSession) =>
        record.status === 'CANCELLED' ? '-' : `${record.attendedCount}/${record.totalStudents}`,
    },
    {
      title: 'Tỷ lệ',
      width: 160,
      render: (_: unknown, record: AttendanceSession) =>
        record.status === 'CANCELLED' ? (
          <Typography.Text type="secondary">-</Typography.Text>
        ) : (
          <Progress percent={record.attendanceRate} size="small" />
        ),
    },
    {
      title: 'Tác vụ',
      align: 'center' as const,
      width: 140,
      render: (_: unknown, record: AttendanceSession) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedSession(record)} />
          </Tooltip>
          {(record.status === 'NOT_STARTED' || record.status === 'OPEN') && (
            <Tooltip title="Hủy phiên">
              <Button
                type="link"
                danger
                icon={<StopOutlined />}
                onClick={() => setCancelSession(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Quản lý buổi điểm danh"
        subtitle="Theo dõi phiên điểm danh theo ngày, hủy phiên và tạo phiên bù"
        extra={
          <Space wrap>
            <Button icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
              Làm mới
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setShowManualModal(true)}
            >
              Tạo phiên bù
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
        <Col xs={12} sm={12} xl={5}>
          <Card className="h-full shadow-sm">
            <Statistic title="Tổng buổi" value={summary.total} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} xl={5}>
          <Card className="h-full shadow-sm">
            <Statistic title="Đang mở" value={summary.open} valueStyle={{ color: '#1677ff' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} xl={5}>
          <Card className="h-full shadow-sm">
            <Statistic title="Đã đóng" value={summary.closed} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} xl={4}>
          <Card className="h-full shadow-sm">
            <Statistic title="Đã hủy" value={summary.cancelled} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={24} xl={5}>
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
            scroll={{ x: 1100 }}
          />
        ) : (
          <Empty description="Không có buổi điểm danh trong ngày này" />
        )}
      </Card>

      {/* Modal chi tiết phiên */}
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
                children: (
                  <Space>
                    {`${selectedSession.subjectName} (${selectedSession.courseCode})`}
                    {selectedSession.isManual && <Tag color="purple">Dạy bù</Tag>}
                  </Space>
                ),
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
                children: selectedSession.status === 'CANCELLED'
                  ? '-'
                  : `${selectedSession.attendedCount}/${selectedSession.totalStudents} (${selectedSession.attendanceRate}%)`,
              },
              ...(selectedSession.isManual && selectedSession.manualReason
                ? [{
                    key: 'manualReason',
                    label: 'Lý do dạy bù',
                    children: selectedSession.manualReason,
                  }]
                : []),
              ...(selectedSession.status === 'CANCELLED' && selectedSession.cancelReason
                ? [{
                    key: 'cancelReason',
                    label: 'Lý do hủy',
                    children: (
                      <Typography.Text type="danger">{selectedSession.cancelReason}</Typography.Text>
                    ),
                  }]
                : []),
              ...(selectedSession.cancelledAt
                ? [{
                    key: 'cancelledAt',
                    label: 'Hủy lúc',
                    children: formatDateTime(selectedSession.cancelledAt),
                  }]
                : []),
            ]}
          />
        )}
      </ModalCustom>

      {/* Modal hủy phiên */}
      <ModalCustom
        open={!!cancelSession}
        title="⚠️ Hủy phiên điểm danh"
        width={520}
        onCancel={() => {
          setCancelSession(null);
          cancelForm.resetFields();
        }}
        footer={null}
      >
        {cancelSession && (
          <div className="flex flex-col gap-4">
            <Alert
              type="warning"
              showIcon
              message={`${cancelSession.subjectName} — ${cancelSession.courseCode}`}
              description={`Phòng ${cancelSession.room} | ${cancelSession.shift} | GV: ${cancelSession.teacherName}`}
            />

            <Form form={cancelForm} layout="vertical" onFinish={handleCancelSubmit}>
              <Form.Item
                name="reason"
                label="Lý do hủy"
                rules={[{ required: true, message: 'Vui lòng nhập lý do hủy' }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="VD: Giáo viên bận họp, nghỉ lễ..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <div className="flex justify-end gap-2">
                <Button onClick={() => { setCancelSession(null); cancelForm.resetFields(); }}>
                  Đóng
                </Button>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={cancelMutation.isPending}
                  icon={<StopOutlined />}
                >
                  Xác nhận hủy
                </Button>
              </div>
            </Form>
          </div>
        )}
      </ModalCustom>

      {/* Modal tạo phiên bù */}
      <ModalCustom
        open={showManualModal}
        title="➕ Tạo phiên điểm danh bù"
        width={680}
        onCancel={handleCloseManualModal}
        footer={null}
      >
        <div className="flex flex-col gap-4">
          <Alert
            type="info"
            showIcon
            message="Tạo phiên điểm danh cho buổi dạy bù"
            description="Chọn lịch học và ngày bù. Hệ thống sẽ tự kiểm tra trùng phòng + giờ với các phiên khác."
          />

          <div className="flex flex-col gap-3">
            <div>
              <Typography.Text strong>Lịch học</Typography.Text>
              <Select
                showSearch
                optionFilterProp="label"
                className="mt-2 w-full"
                placeholder="Chọn lớp HP + lịch học"
                value={manualScheduleId}
                options={scheduleOptions}
                onChange={(value: number) => handleManualScheduleChange(value)}
                allowClear
                onClear={() => handleManualScheduleChange(undefined)}
              />
            </div>

            <div>
              <Typography.Text strong>Ngày dạy bù</Typography.Text>
              <div className="mt-2">
                <DatePickerCustom
                  value={manualDate ? formatDateToPicker(manualDate) : null}
                  onChange={(value) => {
                    const dateStr = value ? formatDateToQuery(value as Dayjs) : undefined;
                    handleManualDateChange(dateStr || undefined);
                  }}
                  allowClear
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {checkingConflict && (
            <Alert type="info" showIcon message="Đang kiểm tra trùng lịch..." />
          )}

          {conflictData && conflictData.hasExisting && (
            <Alert
              type="error"
              showIcon
              message="Phiên đã tồn tại"
              description="Đã có phiên điểm danh cho lịch học này vào ngày đã chọn. Vui lòng chọn ngày khác."
            />
          )}

          {conflictData && conflictData.hasConflict && !conflictData.hasExisting && (
            <Alert
              type="warning"
              showIcon
              message="⚠️ Trùng lịch phòng học!"
              description={
                <div>
                  <div className="mb-2">
                    Phòng <strong>{conflictData.schedule.room}</strong> đã có phiên điểm danh trong khung giờ này:
                  </div>
                  {conflictData.conflicts.map((c, i) => (
                    <div key={i} className="mb-1 rounded bg-orange-50 p-2 text-sm">
                      <strong>{c.subjectName}</strong> ({c.courseCode}) — GV: {c.teacherName}
                      <br />
                      Ca: {c.shift} ({formatTime(c.checkinOpenAt)} - {formatTime(c.checkinCloseAt)})
                    </div>
                  ))}
                </div>
              }
            />
          )}

          {conflictData && !conflictData.hasConflict && !conflictData.hasExisting && (
            <Alert
              type="success"
              showIcon
              message="✅ Không có trùng lịch"
              description={`Phòng ${conflictData.schedule.room} trống trong khung giờ ${conflictData.schedule.shift} vào ngày đã chọn.`}
            />
          )}

          <Form form={manualForm} layout="vertical">
            <Form.Item
              name="reason"
              label="Lý do dạy bù (tuỳ chọn)"
            >
              <Input.TextArea
                rows={2}
                placeholder="VD: Dạy bù buổi ngày 12/08 do GV bận họp"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>

          <div className="flex justify-end gap-2">
            <Button onClick={handleCloseManualModal}>
              Đóng
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              loading={createManualMutation.isPending}
              disabled={
                !manualScheduleId ||
                !manualDate ||
                checkingConflict ||
                (conflictData?.hasExisting ?? false) ||
                (conflictData?.hasConflict ?? false)
              }
              onClick={handleManualSubmit}
            >
              Tạo phiên
            </Button>
          </div>
        </div>
      </ModalCustom>
    </div>
  );
};

export default AttendanceSessionPage;
