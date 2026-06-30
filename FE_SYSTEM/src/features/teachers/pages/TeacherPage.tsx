import useTable from '@/shared/hooks/useTable';
import PageHeader from '@/shared/components/page/PageHeader';
import { Button } from 'antd';
import ModalFormCustom, { type SectionForm } from '@/shared/components/modal/ModalFormCustom';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { FormModalMode } from '@/shared/types/form-modal-mode-type';
import { userRoleAdminApi } from '@/features/users/api/user-api';
import FilterTableCustom from '@/shared/components/table/FilterTableCustom';
import { generalInfoFormFields } from '@/features/users/contants/general-info-form-fields';
import { teacherRoleAdminApi } from '../api/teacher-api';
import type { Teacher } from '../types/teacher-type';
import type { TeacherFilterParams } from '../types/teacher-filter-params-type';
import { teacherFormFields } from '../constants/teacher-form-fields';
import { teacherFilters } from '../constants/teacher-filter-table';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import StatusTag from '@/shared/components/status/StatusTag';
import ActionGroup from '@/shared/components/table/ActionGroup';
import { USER_STATUS } from '@/features/users/types/user-status-type';
import TablePaginationCustom from '@/shared/components/table/TablePaginationCustom';

const TeacherPage = () => {
  const { getAll, create, update } = teacherRoleAdminApi;
  const { changeStatus, remove } = userRoleAdminApi;

  const { open, mode, selectedRecord, openCreate, openView, openEdit, close } =
    useFormModal<Teacher>();

  const {
    data: teachers,

    loading,

    pagination,

    filterValues,

    handleFilterChange,

    handleFilterSubmit,

    handleFilterReset,

    handleChangePage,

    handleDelete,

    handleChangeStatus,

    refetch,
  } = useTable<Teacher, TeacherFilterParams>({
    fetchApi: getAll,
    removeApi: remove,
    changeStatusApi: changeStatus,
  });

  const sectionsTeacherForm: SectionForm<Teacher>[] = [
    {
      key: 'general',
      label: 'Thông tin chung',
      fields: generalInfoFormFields,
    },
    {
      key: 'teacher',
      label: 'Thông tin giáo viên',
      fields: teacherFormFields,
    },
  ];

  const columns = [
    {
      title: 'Mã giáo viên',
      dataIndex: 'teacherCode',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
    },

    {
      title: 'Email',
      dataIndex: 'email',
    },

    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
    },

    {
      title: 'Địa chỉ',
      dataIndex: 'address',
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center' as const,
      render: (_: any, record: any) => {
        return <StatusTag status={record.status} statusText={record.statusText} />;
      },
    },

    {
      title: 'Tác vụ',
      align: 'center' as const,
      render: (_: any, record: Teacher) => {
        return (
          <ActionGroup<Teacher>
            record={record}
            actions={[
              {
                show: () => true,
                icon: <EyeOutlined />,
                tooltip: 'Chi tiết',
                onClick: openView,
              },
              {
                show: (r) => r.status !== USER_STATUS.DELETED,
                icon: <EditOutlined />,
                tooltip: 'Sửa',
                onClick: openEdit,
              },

              {
                show: (r) => r.status === USER_STATUS.ACTIVE,
                icon: <CloseOutlined />,
                tooltip: 'Ngưng hoạt động',
                danger: true,
                onClick: () => handleChangeStatus(record.userId),
                isPopconfirm: true,
              },

              {
                show: (r) => r.status === USER_STATUS.INACTIVE,
                icon: <CheckOutlined />,
                tooltip: 'Kích hoạt',
                color: '#52c41a',
                onClick: () => handleChangeStatus(record.userId),
                isPopconfirm: true,
              },

              {
                show: (r) => r.status === USER_STATUS.INACTIVE,
                icon: <DeleteOutlined />,
                tooltip: 'Xóa',
                danger: true,
                onClick: () => handleDelete(record.userId),
                isPopconfirm: true,
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Quản lý giáo viên"
        subtitle="Danh sách giáo viên"
        extra={
          <Button type="primary" onClick={openCreate}>
            + Thêm giáo viên
          </Button>
        }
      />

      <div className="mb-4">
        <FilterTableCustom
          dataFilters={teacherFilters}
          values={filterValues}
          onChange={handleFilterChange}
          onReset={handleFilterReset}
          onSubmit={handleFilterSubmit}
        />
      </div>

      <TablePaginationCustom<Teacher>
        columns={columns}
        data={teachers}
        loading={loading}
        pagination={pagination}
        onChangePage={handleChangePage}
      />

      <ModalFormCustom<Teacher>
        open={open}
        title="Giáo Viên"
        mode={mode}
        initialValues={selectedRecord}
        disabled={mode === FormModalMode.VIEW}
        onCancel={close}
        onSuccess={refetch}
        onSubmit={
          mode === FormModalMode.CREATE
            ? create
            : (values) => update(selectedRecord!.userId, values)
        }
        sections={sectionsTeacherForm}
      />
    </div>
  );
};

export default TeacherPage;
