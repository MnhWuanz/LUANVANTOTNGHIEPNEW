import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Button, Avatar, Modal, Form, message, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, CheckCircleOutlined, WarningOutlined, CameraOutlined, DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';

interface StudentType {
  key: string;
  mssv: string;
  name: string;
  classCode: string;
  faceStatus: 'registered' | 'unregistered' | 'retake';
  avatar?: string;
}

export const StudentManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Student base list
  const [students, setStudents] = useState<StudentType[]>([
    {
      key: '1',
      mssv: '20201234',
      name: 'Trần Thị Bé',
      classCode: 'CNTT - K62',
      faceStatus: 'registered',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6WPcK8bTlnB5k7nIRHGqHYfG-KJAeBgaJMqFahMU3Fd4TzXzCxGOFk-eguheGU7u9RfxH04FRNDnLsXve-9KUsOFQ6e_pmg6oL3FuFUjcmFMgcY1NroHJKF-qPz1RTylRgItZmgzE6Ng7easWLESPIZYBfkl5Uv3ppU-ByHGLobbhEddj8H2iwYq7VVPMtarQJGJ3C560VQwFd7fKWtMHF9kx5cofo2V-3sExyICTWy6KDKx9cPp3VyyavdpqHDW7BSXebIRpwrOC'
    },
    {
      key: '2',
      mssv: '20205678',
      name: 'Lê Hoàng Nam',
      classCode: 'HTTT - K62',
      faceStatus: 'unregistered'
    },
    {
      key: '3',
      mssv: '20210012',
      name: 'Nguyễn Văn Cường',
      classCode: 'KHMT - K61',
      faceStatus: 'retake',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH-8rtQJT3epSc3eleTgsiJbDxGFa62RkcI8HZo_2DFkfLjpQFX-ze273Ga3yqKPsK8ukuaO4BS1xlOyA90fVYDvockeHatzrV2vU5zdiNnhHHytfpLgrXL-RtHkwVS-8R8GQKkSmexRHJaqe9IT1aqFnxK35ONkBjndHAUyc8-6bZuPa1suoZjH4gy3u_ak1YSkrADRDX_baA8ppiVrEbPQuqrUjpXRg_a2z7wlpN3GGeaWeCGqeFSvBBf1QTQmrC1W9EE6m8Sz3U'
    },
    {
      key: '4',
      mssv: '20208899',
      name: 'Phạm Mai Hương',
      classCode: 'CNTT - K62',
      faceStatus: 'registered',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxHH_SqEpu9RQHqd_UCti2CLyeclfTCg9u1ikkBriviRjSATaEcjhuzgFDFGDEZQ92993HUuUnDMd8J4nBX7BYkJQ71XneogDiJQBpjQBXA9d5se9HZD_JQURzlhVc8c-rcYBZHQ_9UwSdbMKY0vQO2gzZBIlXXyKVzw-OXscgNOcF4V3M4XeTV555ZIjAYIgpN7mg8sWDHWwAANnrc2q5-4KSmwxvvNCjYOtbd8z4WLdFQ5YSUldhSIS7cdcDKM16h0p2AAQSyPNf'
    }
  ]);

  // Filter lists based on input controls
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch =
        student.name.toLowerCase().includes(searchText.toLowerCase()) ||
        student.mssv.includes(searchText);
      
      const matchClass = selectedClass ? student.classCode.includes(selectedClass) : true;
      const matchStatus = selectedStatus ? student.faceStatus === selectedStatus : true;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchText, selectedClass, selectedStatus]);

  const handleAddStudent = (values: any) => {
    const newStudent: StudentType = {
      key: String(Date.now()),
      mssv: values.mssv,
      name: values.name,
      classCode: values.classCode,
      faceStatus: values.faceStatus,
    };
    setStudents(prev => [newStudent, ...prev]);
    setIsModalVisible(false);
    form.resetFields();
    message.success(`Đã thêm thành công sinh viên ${values.name}!`);
  };

  const handleDelete = (key: string, name: string) => {
    setStudents(prev => prev.filter(student => student.key !== key));
    message.warning(`Đã xóa sinh viên ${name} khỏi hệ thống.`);
  };

  const columns = [
    {
      title: <span className="font-semibold text-xs text-on-surface-variant uppercase">MSSV</span>,
      dataIndex: 'mssv',
      key: 'mssv',
      width: '120px',
      render: (text: string) => <span className="font-bold text-sm text-on-surface">{text}</span>,
    },
    {
      title: <span className="font-semibold text-xs text-on-surface-variant uppercase">Họ tên sinh viên</span>,
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: StudentType) => (
        <div className="flex items-center gap-3">
          {record.avatar ? (
            <Avatar src={record.avatar} size={40} className="border border-outline-variant shadow-sm object-cover" />
          ) : (
            <Avatar icon={<UserOutlined />} size={40} className="bg-surface-variant text-on-surface-variant shadow-sm" />
          )}
          <span className="font-semibold text-sm text-on-surface">{text}</span>
        </div>
      ),
    },
    {
      title: <span className="font-semibold text-xs text-on-surface-variant uppercase">Lớp</span>,
      dataIndex: 'classCode',
      key: 'classCode',
      width: '200px',
      render: (text: string) => <span className="text-sm font-medium text-on-surface-variant">{text}</span>,
    },
    {
      title: <span className="font-semibold text-xs text-on-surface-variant uppercase">Trạng thái khuôn mặt</span>,
      dataIndex: 'faceStatus',
      key: 'faceStatus',
      width: '240px',
      render: (status: 'registered' | 'unregistered' | 'retake') => {
        if (status === 'registered') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
              <CheckCircleOutlined className="text-xs" />
              Đã đăng ký
            </span>
          );
        } else if (status === 'unregistered') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
              <WarningOutlined className="text-xs" />
              Chưa đăng ký
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tertiary-fixed text-on-tertiary-fixed-variant border border-tertiary/20">
              <CameraOutlined className="text-xs" />
              Cần chụp lại
            </span>
          );
        }
      },
    },
    {
      title: <span className="font-semibold text-xs text-on-surface-variant uppercase text-right block pr-4">Thao tác</span>,
      key: 'actions',
      width: '120px',
      render: (_: any, record: StudentType) => (
        <div className="text-right flex justify-end gap-1">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-primary hover:bg-primary-container/10 rounded-full"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.key, record.name)}
              className="hover:bg-error-container/10 rounded-full"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Danh sách sinh viên</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Quản lý hồ sơ và trạng thái đăng ký dữ liệu khuôn mặt sinh viên.</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="bg-primary hover:bg-surface-tint border-transparent rounded-lg px-5 py-2.5 h-auto text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow active:scale-95 duration-150"
        >
          Thêm sinh viên
        </Button>
      </div>

      {/* Table Controls: Search & Select Filters */}
      <div className="bg-surface-container-lowest p-5 rounded-t-xl border border-outline-variant border-b-0 flex flex-col md:flex-row gap-4 justify-between items-center shadow-soft-card relative z-10">
        
        {/* Dropdowns filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Class filter */}
          <Select
            value={selectedClass}
            onChange={setSelectedClass}
            placeholder="Tất cả Lớp"
            className="w-40 font-be-vietnam"
            size="large"
            options={[
              { value: '', label: 'Tất cả Lớp' },
              { value: 'CNTT', label: 'CNTT - K62' },
              { value: 'HTTT', label: 'HTTT - K62' },
              { value: 'KHMT', label: 'KHMT - K61' },
            ]}
          />
          {/* Status filter */}
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Tất cả Trạng thái"
            className="w-48 font-be-vietnam"
            size="large"
            options={[
              { value: '', label: 'Tất cả Trạng thái' },
              { value: 'registered', label: 'Đã đăng ký' },
              { value: 'unregistered', label: 'Chưa đăng ký' },
              { value: 'retake', label: 'Cần chụp lại' },
            ]}
          />
        </div>

        {/* Text Search input */}
        <div className="relative w-full md:w-72">
          <Input
            prefix={<SearchOutlined className="text-outline mr-2" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm theo MSSV, Họ tên..."
            size="large"
            className="rounded-lg py-2 border-outline-variant hover:border-primary/50 font-be-vietnam text-sm"
          />
        </div>

      </div>

      {/* Dynamic Data Table */}
      <div className="bg-surface-container-lowest rounded-b-xl border border-outline-variant shadow-soft-card overflow-hidden">
        <Table
          dataSource={filteredStudents}
          columns={columns}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            className: 'px-6 py-4 border-t border-outline-variant/30 bg-surface-container-lowest m-0 flex justify-between font-be-vietnam',
            showTotal: (total) => <span className="text-xs font-semibold text-on-surface-variant">Hiển thị {filteredStudents.length} của {total} sinh viên</span>
          }}
          className="rounded-b-xl border-collapse"
          rowClassName="hover:bg-surface-container-low transition-colors"
        />
      </div>

      {/* Add Student Modal Form */}
      <Modal
        title={<span className="font-headline-sm text-headline-sm font-bold text-on-surface">Thêm sinh viên mới</span>}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        className="font-be-vietnam"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddStudent}
          requiredMark={false}
          className="space-y-4 mt-4"
        >
          <Form.Item
            label={<span className="font-semibold text-xs text-on-surface">Mã số sinh viên (MSSV)</span>}
            name="mssv"
            rules={[
              { required: true, message: 'Vui lòng nhập MSSV!' },
              { pattern: /^[0-9]+$/, message: 'MSSV chỉ chứa ký số!' }
            ]}
          >
            <Input placeholder="Ví dụ: 20208888" size="large" className="rounded-lg border-outline-variant py-2" />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-xs text-on-surface">Họ và tên</span>}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn Hải" size="large" className="rounded-lg border-outline-variant py-2" />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-xs text-on-surface">Lớp học phần</span>}
            name="classCode"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
          >
            <Select
              placeholder="Chọn lớp"
              size="large"
              options={[
                { value: 'CNTT - K62', label: 'CNTT - K62' },
                { value: 'HTTT - K62', label: 'HTTT - K62' },
                { value: 'KHMT - K61', label: 'KHMT - K61' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-xs text-on-surface">Trạng thái dữ liệu khuôn mặt</span>}
            name="faceStatus"
            initialValue="unregistered"
            rules={[{ required: true }]}
          >
            <Select
              size="large"
              options={[
                { value: 'registered', label: 'Đã đăng ký' },
                { value: 'unregistered', label: 'Chưa đăng ký' },
                { value: 'retake', label: 'Cần chụp lại' },
              ]}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
              className="rounded-lg py-2.5 h-auto text-sm font-semibold border-outline-variant text-on-surface"
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="rounded-lg py-2.5 h-auto text-sm font-semibold bg-primary hover:bg-primary-container border-transparent"
            >
              Thêm sinh viên
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
};
export default StudentManagement;
