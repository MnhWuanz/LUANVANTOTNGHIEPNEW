import PageHeader from '@/shared/components/page/PageHeader';
import FilterTableCustom from '@/shared/components/table/FilterTableCustom';
import ActionGroup from '@/shared/components/table/ActionGroup';
import TablePaginationCustom from '@/shared/components/table/TablePaginationCustom';
import ModalFormCustom, { type SectionForm } from '@/shared/components/modal/ModalFormCustom';
import ModalCustom from '@/shared/components/modal/ModalCustom';
import useTable from '@/shared/hooks/useTable';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { useNotification } from '@/shared/hooks/useNotification';
import { FormModalMode } from '@/shared/types/form-modal-mode-type';
import { Button, Descriptions, Space, Tag, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { kioskRoleAdminApi } from '../api/kisok-api';
import { kioskFormFields } from '../constant/kiosk-form-fields';
import { kioskFilters } from '../constant/kisok-filter-table';
import type { KioskFilterParams } from '../types/kiosk-filter-params-type';
import {
  KIOSK_STATUS,
  KIOSK_STATUS_LABEL,
  type CreateKioskPayload,
  type Kiosk,
  type KioskStatus,
} from '../types/kiosk-type';

const statusColors: Record<KioskStatus, string> = {
  [KIOSK_STATUS.PENDING]: 'warning',
  [KIOSK_STATUS.ACTIVE]: 'success',
  [KIOSK_STATUS.INACTIVE]: 'default',
  [KIOSK_STATUS.BLOCKED]: 'error',
};

const formatDateTime = (value?: string | null) => {
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
};

const renderStatusTag = (status: KioskStatus) => (
  <Tag color={statusColors[status]}>{KIOSK_STATUS_LABEL[status] || status}</Tag>
);

const KioskPage = () => {
  const { getAll, create } = kioskRoleAdminApi;
  const { showNotification } = useNotification();
  const { open, mode, selectedRecord, openCreate, openView, close } = useFormModal<Kiosk>();

  const {
    data: kiosks,
    loading,
    pagination,
    filterValues,
    handleFilterChange,
    handleFilterSubmit,
    handleFilterReset,
    handleChangePage,
    refetch,
  } = useTable<Kiosk, KioskFilterParams>({
    fetchApi: getAll,
  });

  const sectionsKioskForm: SectionForm<Kiosk>[] = [
    {
      key: 'general',
      label: 'Thông tin thiết bị',
      fields: kioskFormFields,
    },
  ];

  const handleCreate = async (values: Kiosk) => {
    await create({
      device_name: values.device_name,
      id_room: Number(values.id_room),
    } satisfies CreateKioskPayload);
  };
 
  const handleCopyActivationCode = async (record: Kiosk) => {
    if (!record.latestActivationCode) {
      showNotification('warning', 'Không có mã kích hoạt', 'Kiosk này chưa có mã kích hoạt');
      return;
    }

    try {
      await navigator.clipboard.writeText(String(record.latestActivationCode));
      showNotification('success', 'Đã sao chép', 'Mã kích hoạt đã được sao chép');
    } catch {
      showNotification('error', 'Không thể sao chép', 'Vui lòng sao chép mã thủ công');
    }
  };

  const columns = [
    {
      title: 'Mã thiết bị',
      dataIndex: 'device_code',
      render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'device_name',
    },
    {
      title: 'Phòng học',
      render: (_: unknown, record: Kiosk) => record.room_code || record.room?.room_code || `#${record.id_room}`,
    },
    {
      title: 'Mã kích hoạt',
      align: 'center' as const,
      render: (_: unknown, record: Kiosk) =>
        record.latestActivationCode ? (
          <Typography.Text code>{record.latestActivationCode}</Typography.Text>
        ) : (
          '-'
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center' as const,
      render: (status: KioskStatus) => renderStatusTag(status),
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'is_active',
      align: 'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}</Tag>
      ),
    },
    {
      title: 'Lần cuối online',
      dataIndex: 'last_seen_at',
      render: (value: string | null) => formatDateTime(value),
    },
    {
      title: 'Tác vụ',
      align: 'center' as const,
      render: (_: unknown, record: Kiosk) => (
        <ActionGroup<Kiosk>
          record={record}
          actions={[
            {
              show: () => true,
              icon: <EyeOutlined />,
              tooltip: 'Chi tiết',
              onClick: openView,
            },
            {
              show: () => true,
              icon: <CopyOutlined />,
              tooltip: 'Sao chép mã kích hoạt',
              onClick: handleCopyActivationCode,
            },
            {
              show: () => true,
              icon: <DeleteOutlined />,
              isPopconfirm:true,
              danger:true,
              tooltip: 'Xóa thiết bị này',
              onClick: async(record)=>{
                await kioskRoleAdminApi.delete(record.id_kiosk);
                showNotification("success","","Xóa thiết bị thành công");
                refetch()
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Quản lý Kiosk"
        subtitle="Danh sách thiết bị Kiosk"
        extra={
          <Button type="primary" onClick={openCreate}>
            + Thêm Kiosk
          </Button>
        }
      />

      <div className="mb-4">
        <FilterTableCustom
          dataFilters={kioskFilters}
          values={filterValues}
          onChange={handleFilterChange}
          onReset={handleFilterReset}
          onSubmit={handleFilterSubmit}
        />
      </div>

      <TablePaginationCustom<Kiosk>
        columns={columns}
        data={kiosks}
        loading={loading}
        pagination={pagination}
        onChangePage={handleChangePage}
      />

      <ModalFormCustom<Kiosk>
        open={open && mode === FormModalMode.CREATE}
        title="Kiosk"
        mode={mode}
        initialValues={selectedRecord}
        onCancel={close}
        onSuccess={refetch}
        onSubmit={handleCreate}
        sections={sectionsKioskForm}
      />

      <ModalCustom
        open={open && mode === FormModalMode.VIEW}
        title="Thông tin Kiosk"
        onCancel={close}
        width={760}
      >
        {selectedRecord && (
          <Space direction="vertical" size={16} className="w-full">
            <Descriptions
              bordered
              column={1}
              size="small"
              items={[
                {
                  key: 'device_code',
                  label: 'Mã thiết bị',
                  children: <Typography.Text code>{selectedRecord.device_code}</Typography.Text>,
                },
                {
                  key: 'device_name',
                  label: 'Tên thiết bị',
                  children: selectedRecord.device_name,
                },
                {
                  key: 'room',
                  label: 'Phòng học',
                  children:
                    selectedRecord.room_code || selectedRecord.room?.room_code || `#${selectedRecord.id_room}`,
                },
                {
                  key: 'activation_code',
                  label: 'Mã kích hoạt',
                  children: selectedRecord.latestActivationCode ? (
                    <Typography.Text code>{selectedRecord.latestActivationCode}</Typography.Text>
                  ) : (
                    '-'
                  ),
                },
                {
                  key: 'status',
                  label: 'Trạng thái',
                  children: renderStatusTag(selectedRecord.status),
                },
                {
                  key: 'activated_at',
                  label: 'Ngày kích hoạt',
                  children: formatDateTime(selectedRecord.activated_at),
                },
                {
                  key: 'last_seen_at',
                  label: 'Lần cuối online',
                  children: formatDateTime(selectedRecord.last_seen_at),
                },
                {
                  key: 'created_at',
                  label: 'Ngày tạo',
                  children: formatDateTime(selectedRecord.created_at),
                },
              ]}
            />
          </Space>
        )}
      </ModalCustom>
    </div>
  );
};

export default KioskPage;

