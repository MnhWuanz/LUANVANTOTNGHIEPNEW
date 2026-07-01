import { useCallback, useEffect, useState } from 'react';
import type { TableColumnsType } from 'antd';
import {
  Select,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Result,
  Spin,
  Badge,
  Descriptions,
  Grid,
  Empty,
} from 'antd';
import {
  CameraOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ScanOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ModalCustom from '@/shared/components/modal/ModalCustom';
import { useNotification } from '@/shared/hooks/useNotification';
import { faceEnrollmentApi } from '../api/face-enrollment-api';
import type {
  CourseClassItem,
  StudentInCourseClass,
} from '../types/face-enrollment-type';
import WebcamCapture from '../components/WebcamCapture';

const { Text, Title } = Typography;

const FaceEnrollmentPage = () => {
  const { showNotification } = useNotification();
  const screens = Grid.useBreakpoint();
  const compact = !screens.lg;

  const [courseClasses, setCourseClasses] = useState<CourseClassItem[]>([]);
  const [students, setStudents] = useState<StudentInCourseClass[]>([]);
  const [selectedCourseClass, setSelectedCourseClass] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentInCourseClass | null>(null);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const [webcamModalOpen, setWebcamModalOpen] = useState(false);
  const [enrollResult, setEnrollResult] = useState<{
    studentName: string;
    studentCode: string;
    qualityScore: number | null;
  } | null>(null);

  useEffect(() => {
    const fetchCourseClasses = async () => {
      setLoadingClasses(true);

      try {
        const data = await faceEnrollmentApi.getMyCourseClasses();
        setCourseClasses(data);
      } catch {
        showNotification('error', 'Lỗi', 'Không thể tải danh sách lớp học phần');
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchCourseClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedCourseClass) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoadingStudents(true);

      try {
        const data = await faceEnrollmentApi.getStudentsByCourseClass(selectedCourseClass);
        setStudents(data);
      } catch {
        showNotification('error', 'Lỗi', 'Không thể tải danh sách sinh viên');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseClass]);

  const handleCourseClassChange = (value?: number) => {
    setSelectedCourseClass(value ?? null);
    setSelectedStudent(null);
  };

  const handleOpenWebcam = (student: StudentInCourseClass) => {
    setSelectedStudent(student);
    setEnrollResult(null);
    setWebcamModalOpen(true);
  };

  const handleCloseWebcam = () => {
    setWebcamModalOpen(false);
    setSelectedStudent(null);
    setEnrollResult(null);
  };

  const handleCapture = useCallback(
    async (imageBlob: Blob) => {
      if (!selectedStudent) return;

      setEnrolling(true);

      try {
        const result = await faceEnrollmentApi.enrollFace(selectedStudent.id_student, imageBlob);

        setEnrollResult({
          studentName: result.student.fullName,
          studentCode: result.student.studentCode,
          qualityScore: result.qualityScore,
        });

        showNotification(
          'success',
          'Đăng ký khuôn mặt thành công',
          `Đã đăng ký khuôn mặt cho sinh viên ${result.student.fullName}`,
        );

        setStudents((prev) =>
          prev.map((student) =>
            student.id_student === selectedStudent.id_student
              ? {
                  ...student,
                  is_face_registered: true,
                  active_face_enrollment: {
                    id_face_enrollment: result.idFaceEnrollment,
                    enrolled_at: result.enrolledAt,
                    quality_score: result.qualityScore,
                  },
                }
              : student,
          ),
        );
      } catch (error: unknown) {
        const message =
          typeof error === 'object' && error !== null && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;

        showNotification(
          'error',
          'Đăng ký khuôn mặt thất bại',
          message || 'Đã có lỗi xảy ra khi đăng ký khuôn mặt',
        );
      } finally {
        setEnrolling(false);
      }
    },
    [selectedStudent, showNotification],
  );

  const selectedClassInfo = courseClasses.find((courseClass) => courseClass.id_course_class === selectedCourseClass);
  const registeredCount = students.filter((student) => student.is_face_registered).length;
  const totalCount = students.length;

  const renderStatusTag = (record: StudentInCourseClass) =>
    record.is_face_registered ? (
      <Tag icon={<CheckCircleFilled />} color="success" style={{ borderRadius: 20, padding: '2px 12px' }}>
        Đã đăng ký
      </Tag>
    ) : (
      <Tag icon={<CloseCircleFilled />} color="default" style={{ borderRadius: 20, padding: '2px 12px' }}>
        Chưa đăng ký
      </Tag>
    );

  const renderQualityScore = (record: StudentInCourseClass) => {
    const score = record.active_face_enrollment?.quality_score;

    if (score === null || score === undefined) {
      return <Text type="secondary">-</Text>;
    }

    const color = score >= 99 ? '#52c41a' : score >= 95 ? '#faad14' : '#ff4d4f';

    return (
      <Text strong style={{ color }}>
        {score.toFixed(1)}%
      </Text>
    );
  };

  const renderEnrollButton = (record: StudentInCourseClass, block = false) => (
    <Button
      block={block}
      type={record.is_face_registered ? 'default' : 'primary'}
      icon={<CameraOutlined />}
      onClick={() => handleOpenWebcam(record)}
      size="middle"
    >
      {record.is_face_registered ? 'Đăng ký lại' : 'Đăng ký'}
    </Button>
  );

  const columns: TableColumnsType<StudentInCourseClass> = [
    {
      title: 'STT',
      width: 60,
      align: 'center',
      render: (_value, _record, index) => index + 1,
    },
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
      title: 'Trạng thái khuôn mặt',
      width: 180,
      align: 'center',
      render: (_value, record) => renderStatusTag(record),
    },
    {
      title: 'Độ tin cậy',
      width: 120,
      align: 'center',
      render: (_value, record) => renderQualityScore(record),
    },
    {
      title: 'Thao tác',
      width: 160,
      align: 'center',
      render: (_value, record) => renderEnrollButton(record),
    },
  ];

  const renderStudentCards = () => {
    if (loadingStudents) {
      return (
        <div className="py-10 text-center">
          <Spin />
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có sinh viên nào trong lớp học phần này"
          className="py-8"
        />
      );
    }

    return (
      <div className="flex flex-col gap-3 p-3">
        {students.map((student) => (
          <div key={student.id_student} className="rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#141414] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Text code>{student.student_code}</Text>
                <div className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{student.full_name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Lớp: {student.class}</div>
              </div>
              {renderStatusTag(student)}
            </div>

            <div className="mt-3 flex items-center justify-between rounded bg-gray-50 dark:bg-[#1f1f1f] px-3 py-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Độ tin cậy</span>
              {renderQualityScore(student)}
            </div>

            <div className="mt-3">{renderEnrollButton(student, true)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg bg-white dark:bg-[#141414] p-4 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">Đăng ký khuôn mặt</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 md:text-base">
            Chụp ảnh khuôn mặt sinh viên để đăng ký vào hệ thống điểm danh
          </p>
        </div>

        {selectedCourseClass !== null && totalCount > 0 ? (
          <Space size="small" className="shrink-0">
            <Badge
              count={`${registeredCount}/${totalCount}`}
              style={{
                backgroundColor: registeredCount === totalCount ? '#52c41a' : '#1677ff',
                fontSize: 13,
                padding: '0 10px',
              }}
            />
            <Text type="secondary">đã đăng ký</Text>
          </Space>
        ) : null}
      </div>

      <Card size="small" styles={{ body: { padding: compact ? 16 : '16px 24px' } }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <ScanOutlined style={{ fontSize: 22, color: '#1677ff' }} />

          <div className="min-w-0 flex-1">
            <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
              Chọn lớp học phần
            </Text>
            <Select
              placeholder="Chọn lớp học phần để xem danh sách sinh viên..."
              style={{ width: '100%' }}
              size={compact ? 'middle' : 'large'}
              loading={loadingClasses}
              value={selectedCourseClass}
              onChange={handleCourseClassChange}
              showSearch
              optionFilterProp="label"
              options={courseClasses.map((courseClass) => ({
                label: `${courseClass.course_code} - ${courseClass.subject_name} (${courseClass.total_students} SV)`,
                value: courseClass.id_course_class,
              }))}
              allowClear
              onClear={() => {
                setSelectedCourseClass(null);
                setStudents([]);
              }}
            />
          </div>

          {selectedClassInfo && (
            <div className="grid grid-cols-2 gap-4 rounded-md bg-gray-50 dark:bg-[#1f1f1f] p-3 lg:min-w-64">
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Mã môn học
                </Text>
                <div>
                  <Text code>{selectedClassInfo.subject_code}</Text>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Sĩ số
                </Text>
                <div>
                  <Text strong>{selectedClassInfo.total_students} sinh viên</Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {selectedCourseClass ? (
        <Card styles={{ body: { padding: 0 } }}>
          {compact ? (
            renderStudentCards()
          ) : (
            <Table<StudentInCourseClass>
              columns={columns}
              dataSource={students}
              rowKey="id_student"
              loading={loadingStudents}
              pagination={false}
              scroll={{ y: 'calc(100vh - 420px)' }}
              size="middle"
              locale={{
                emptyText: (
                  <div style={{ padding: '40px 0' }}>
                    <UserOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <div>
                      <Text type="secondary">Không có sinh viên nào trong lớp học phần này</Text>
                    </div>
                  </div>
                ),
              }}
            />
          )}
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: compact ? '36px 0' : '60px 0' }}>
            <ScanOutlined style={{ fontSize: compact ? 48 : 64, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={compact ? 5 : 4} type="secondary" style={{ marginBottom: 8 }}>
              Chọn lớp học phần để bắt đầu
            </Title>
            <Text type="secondary">
              Vui lòng chọn lớp học phần ở trên để xem danh sách sinh viên và tiến hành đăng ký khuôn mặt
            </Text>
          </div>
        </Card>
      )}

      <ModalCustom
        open={webcamModalOpen}
        title="Đăng ký khuôn mặt sinh viên"
        onCancel={handleCloseWebcam}
        width={compact ? '96vw' : 640}
      >
        {selectedStudent && (
          <div>
            <Descriptions
              bordered
              size="small"
              column={compact ? 1 : 2}
              style={{ marginBottom: 24 }}
              items={[
                {
                  key: 'student_code',
                  label: 'MSSV',
                  children: <Text code>{selectedStudent.student_code}</Text>,
                },
                {
                  key: 'full_name',
                  label: 'Họ tên',
                  children: <Text strong>{selectedStudent.full_name}</Text>,
                },
                {
                  key: 'class',
                  label: 'Lớp',
                  children: selectedStudent.class,
                },
                {
                  key: 'status',
                  label: 'Trạng thái',
                  children: selectedStudent.is_face_registered ? (
                    <Tag color="success" icon={<CheckCircleFilled />}>
                      Đã đăng ký
                    </Tag>
                  ) : (
                    <Tag color="default" icon={<CloseCircleFilled />}>
                      Chưa đăng ký
                    </Tag>
                  ),
                },
              ]}
            />

            {enrollResult ? (
              <Result
                status="success"
                title="Đăng ký khuôn mặt thành công"
                subTitle={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      Sinh viên:{' '}
                      <Text strong>
                        {enrollResult.studentName} ({enrollResult.studentCode})
                      </Text>
                    </div>
                    {enrollResult.qualityScore !== null && (
                      <div>
                        Độ tin cậy:{' '}
                        <Text strong style={{ color: enrollResult.qualityScore >= 99 ? '#52c41a' : '#faad14' }}>
                          {enrollResult.qualityScore.toFixed(1)}%
                        </Text>
                      </div>
                    )}
                  </div>
                }
                extra={
                  <Button type="primary" onClick={handleCloseWebcam}>
                    Hoàn tất
                  </Button>
                }
              />
            ) : (
              <Spin spinning={enrolling} tip="Đang xử lý đăng ký khuôn mặt...">
                <WebcamCapture onCapture={handleCapture} loading={enrolling} disabled={enrolling} />
              </Spin>
            )}
          </div>
        )}
      </ModalCustom>
    </div>
  );
};

export default FaceEnrollmentPage;
