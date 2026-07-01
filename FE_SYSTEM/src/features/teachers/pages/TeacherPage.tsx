import PageHeader from '@/shared/components/page/PageHeader';
import FilterTableCustom from '@/shared/components/table/FilterTableCustom';
import TablePaginationCustom from '@/shared/components/table/TablePaginationCustom';
import ModalCustom from '@/shared/components/modal/ModalCustom';
import useTable from '@/shared/hooks/useTable';
import { useNotification } from '@/shared/hooks/useNotification';
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  Space,
  Tag,
  Typography,
} from 'antd';
import { EditOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { teacherRoleAdminApi } from '../api/teacher-api';
import { teacherFilters } from '../constants/teacher-filter-table';
import type { TeacherFilterParams } from '../types/teacher-filter-params-type';
import type { Teacher, UpdateTeacherPayload } from '../types/teacher-type';

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

const TeacherStatusTag = ({ teacher }: { teacher: Teacher }) => (
  <Tag color={teacher.is_active ? 'success' : 'default'}>{teacher.statusText}</Tag>
);

const TeacherPage = () => {
  const { getAll, update } = teacherRoleAdminApi;
  const { showNotification } = useNotification();
  const [viewRecord, setViewRecord] = useState<Teacher | null>(null);
  const [editingRecord, setEditingRecord] = useState<Teacher | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<UpdateTeacherPayload>();

  const {
    data: teachers,
    loading,
    pagination,
    filterValues,
    handleFilterChange,
    handleFilterSubmit,
    handleFilterReset,
    handleChangePage,
    refetch,
  } = useTable<Teacher, TeacherFilterParams>({
    fetchApi: getAll,
  });

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        full_name: editingRecord.full_name,
        teacher_code: editingRecord.teacher_code,
        email: editingRecord.email,
        password: undefined,
      });
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  const handleUpdateTeacher = async (values: UpdateTeacherPayload) => {
    if (!editingRecord) {
      return;
    }

    const payload: UpdateTeacherPayload = {
      full_name: values.full_name?.trim(),
      teacher_code: values.teacher_code?.trim(),
      email: values.email?.trim(),
    };

    if (values.password?.trim()) {
      payload.password = values.password.trim();
    }

    try {
      setSaving(true);
      await update(editingRecord.id_teacher, payload);
      showNotification('success', 'Cập nhật giáo viên', 'Thông tin giáo viên đã được cập nhật');
      setEditingRecord(null);
      refetch();
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      showNotification('error', 'Cập nhật giáo viên thất bại', message || 'Đã có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Mã giáo viên',
      dataIndex: 'teacher_code',
      render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'full_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Trạng thái',
      align: 'center' as const,
      render: (_: unknown, record: Teacher) => <TeacherStatusTag teacher={record} />,
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'last_login',
      render: (value: string | null) => formatDateTime(value),
    },
    {
      title: 'Ngày tạo tài khoản',
      dataIndex: 'createdAt',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Tác vụ',
      align: 'center' as const,
      width: 140,
      render: (_: unknown, record: Teacher) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setViewRecord(record)} />
          <Button type="link" icon={<EditOutlined />} onClick={() => setEditingRecord(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Quản lý giáo viên"
        subtitle="Danh sách tài khoản giáo viên được đồng bộ từ hệ thống đào tạo"
        extra={
          <Button icon={<ReloadOutlined />} loading={loading} onClick={refetch}>
            Làm mới
          </Button>
        }
      />

      <Alert
        type="info"
        showIcon
        message="Dữ liệu giáo viên được đồng bộ"
        description="Trang này hỗ trợ xem và cập nhật thông tin tài khoản giáo viên."
      />

      <FilterTableCustom
        dataFilters={teacherFilters}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
        onSubmit={handleFilterSubmit}
      />

      <TablePaginationCustom<Teacher>
        columns={columns}
        data={teachers}
        loading={loading}
        pagination={pagination}
        onChangePage={handleChangePage}
      />

      <ModalCustom
        open={!!viewRecord}
        title="Thông tin giáo viên"
        onCancel={() => setViewRecord(null)}
        width={720}
      >
        {viewRecord && (
          <Descriptions
            bordered
            size="small"
            column={1}
            items={[
              {
                key: 'teacher_code',
                label: 'Mã giáo viên',
                children: <Typography.Text code>{viewRecord.teacher_code}</Typography.Text>,
              },
              {
                key: 'full_name',
                label: 'Họ tên',
                children: viewRecord.full_name,
              },
              {
                key: 'email',
                label: 'Email',
                children: viewRecord.email,
              },
              {
                key: 'status',
                label: 'Trạng thái',
                children: <TeacherStatusTag teacher={viewRecord} />,
              },
              {
                key: 'last_login',
                label: 'Đăng nhập cuối',
                children: formatDateTime(viewRecord.last_login),
              },
              {
                key: 'createdAt',
                label: 'Ngày tạo tài khoản',
                children: formatDateTime(viewRecord.createdAt),
              },
            ]}
          />
        )}
      </ModalCustom>

      <ModalCustom
        open={!!editingRecord}
        title="Cập nhật giáo viên"
        onCancel={() => setEditingRecord(null)}
        width={720}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateTeacher}>
          <Form.Item
            name="full_name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            name="teacher_code"
            label="Mã giáo viên"
            rules={[{ required: true, message: 'Vui lòng nhập mã giáo viên' }]}
          >
            <Input placeholder="Nhập mã giáo viên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[{ min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}
          >
            <Input.Password placeholder="Để trống nếu không đổi mật khẩu" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditingRecord(null)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Lưu
            </Button>
          </div>
        </Form>
      </ModalCustom>
    </div>
  );
};

export default TeacherPage;
