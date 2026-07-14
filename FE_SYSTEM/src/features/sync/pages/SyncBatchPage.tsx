import PageHeader from '@/shared/components/page/PageHeader';
import FilterTableCustom from '@/shared/components/table/FilterTableCustom';
import ModalCustom from '@/shared/components/modal/ModalCustom';
import { FormFieldType } from '@/shared/types/form-field-type';
import { PAGE_DEFAULT, PAGE_LIMIT } from '@/shared/constants/pagination';
import { Alert, Button, Card, Col, Descriptions, Empty, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { DatabaseOutlined, EyeOutlined, PlusCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { syncBatchApi } from '../api/sync-api';
import type { SyncBatch, SyncBatchFilterParams, SyncBatchSummary } from '../types/sync-type';

const summaryLabels: Record<string, string> = {
  users: 'Người dùng',
  subjects: 'Môn học',
  teachers: 'Giáo viên',
  rooms: 'Phòng học',
  shifts: 'Ca học',
  students: 'Sinh viên',
  courseClasses: 'Lớp học phần',
  courseSchedules: 'Lịch học',
  enrollments: 'Ghi danh',
};

const summaryOrder = [
  'users',
  'subjects',
  'teachers',
  'rooms',
  'shifts',
  'students',
  'courseClasses',
  'courseSchedules',
  'enrollments',
];

const syncFilters = [
  {
    name: 'keySearch',
    type: FormFieldType.Input,
    placeholder: 'Tìm mã batch, số bản ghi',
  },
  {
    name: 'startDate',
    type: FormFieldType.DatePicker,
    placeholder: 'Từ ngày',
  },
  {
    name: 'endDate',
    type: FormFieldType.DatePicker,
    placeholder: 'Đến ngày',
  },
];

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

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function toStartOfDay(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function toEndOfDay(value?: string) {
  return value ? new Date(`${value}T23:59:59.999`) : null;
}

function filterBatches(items: SyncBatch[], filters: Partial<SyncBatchFilterParams>) {
  const keyword = filters.keySearch?.trim().toLowerCase();
  const startDate = toStartOfDay(filters.startDate);
  const endDate = toEndOfDay(filters.endDate);

  return items.filter((item) => {
    const syncedAt = new Date(item.synced_at);
    const matchesKeyword = keyword
      ? [
          `#${item.id_sync_batch}`,
          String(item.id_sync_batch),
          String(item.total_records),
          String(item.total_created),
          String(item.total_updated),
          formatDateTime(item.synced_at),
        ].some((value) => value.toLowerCase().includes(keyword))
      : true;

    const matchesStartDate = startDate ? syncedAt >= startDate : true;
    const matchesEndDate = endDate ? syncedAt <= endDate : true;

    return matchesKeyword && matchesStartDate && matchesEndDate;
  });
}

function buildSummaryRows(summary: SyncBatchSummary | null) {
  if (!summary) {
    return [];
  }

  const keys = [
    ...summaryOrder.filter((key) => summary[key]),
    ...Object.keys(summary).filter((key) => !summaryOrder.includes(key)),
  ];

  return keys.map((key) => ({
    key,
    label: summaryLabels[key] || key,
    created: summary[key]?.created || 0,
    updated: summary[key]?.updated || 0,
  }));
}

const SyncBatchPage = () => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [activeFilters, setActiveFilters] = useState<Partial<SyncBatchFilterParams>>({});
  const [pagination, setPagination] = useState({
    page: PAGE_DEFAULT,
    limit: PAGE_LIMIT,
  });
  const [selectedBatch, setSelectedBatch] = useState<SyncBatch | null>(null);

  const { data = [], isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['sync-batches'],
    queryFn: syncBatchApi.getAll,
  });

  const filteredBatches = useMemo(
    () => filterBatches(data, activeFilters),
    [data, activeFilters],
  );

  const paginatedBatches = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;

    return filteredBatches.slice(start, start + pagination.limit);
  }, [filteredBatches, pagination.limit, pagination.page]);

  const summary = useMemo(
    () => ({
      latest: filteredBatches[0],
      totalBatches: filteredBatches.length,
      totalRecords: filteredBatches.reduce((sum, item) => sum + item.total_records, 0),
      totalCreated: filteredBatches.reduce((sum, item) => sum + item.total_created, 0),
      totalUpdated: filteredBatches.reduce((sum, item) => sum + item.total_updated, 0),
    }),
    [filteredBatches],
  );

  const selectedSummaryRows = useMemo(
    () => buildSummaryRows(selectedBatch?.summary || null),
    [selectedBatch],
  );

  const handleFilterSubmit = () => {
    setActiveFilters(filterValues);
    setPagination((prev) => ({ ...prev, page: PAGE_DEFAULT }));
  };

  const handleFilterReset = () => {
    setFilterValues({});
    setActiveFilters({});
    setPagination((prev) => ({ ...prev, page: PAGE_DEFAULT }));
  };

  const columns = [
    {
      title: 'Batch',
      dataIndex: 'id_sync_batch',
      width: 120,
      render: (value: number) => <Typography.Text code>#{value}</Typography.Text>,
    },
    {
      title: 'Thời gian đồng bộ',
      dataIndex: 'synced_at',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Tổng bản ghi',
      dataIndex: 'total_records',
      align: 'right' as const,
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Tạo mới',
      dataIndex: 'total_created',
      align: 'right' as const,
      render: (value: number) => <Tag color="success">+{formatNumber(value)}</Tag>,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'total_updated',
      align: 'right' as const,
      render: (value: number) => <Tag color="processing">{formatNumber(value)}</Tag>,
    },
    {
      title: 'Tác vụ',
      align: 'center' as const,
      width: 100,
      render: (_: unknown, record: SyncBatch) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedBatch(record)} />
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Theo dõi đồng bộ"
        subtitle="Lịch sử dữ liệu được đồng bộ từ hệ thống đào tạo"
        extra={
          <Button type="primary" icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
            Làm mới
          </Button>
        }
      />

      <Alert
        type="info"
        showIcon
        message="Lịch sử hiện chỉ ghi nhận các lần đồng bộ thành công"
        description="Backend hiện chỉ tạo batch sau khi sync hoàn tất, nên các lỗi đồng bộ chưa xuất hiện trong danh sách này."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="h-full shadow-sm">
            <Statistic
              title="Đồng bộ gần nhất"
              value={summary.latest ? formatDateTime(summary.latest.synced_at) : 'Chưa có dữ liệu'}
              prefix={<DatabaseOutlined />}
              valueStyle={{ fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="h-full shadow-sm">
            <Statistic title="Số lần đồng bộ" value={summary.totalBatches} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card className="h-full shadow-sm">
            <Statistic title="Tổng bản ghi" value={summary.totalRecords} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card className="h-full shadow-sm">
            <Statistic title="Tạo mới" value={summary.totalCreated} valueStyle={{ color: '#52c41a' }} prefix={<PlusCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card className="h-full shadow-sm">
            <Statistic title="Cập nhật" value={summary.totalUpdated} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
      </Row>

      <FilterTableCustom
        dataFilters={syncFilters}
        values={filterValues}
        onChange={setFilterValues}
        onReset={handleFilterReset}
        onSubmit={handleFilterSubmit}
      />

      {isError && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải lịch sử đồng bộ"
          description="Vui lòng kiểm tra backend hoặc thử làm mới lại trang."
        />
      )}

      <Card title="Danh sách lần đồng bộ" className="flex-1 shadow-sm">
        <Table<SyncBatch>
          rowKey="id"
          columns={columns}
          dataSource={paginatedBatches}
          loading={isLoading}
          locale={{ emptyText: <Empty description="Chưa có lịch sử đồng bộ" /> }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: filteredBatches.length,
            showSizeChanger: true,
            onChange: (page, pageSize) => setPagination({ page, limit: pageSize }),
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      <ModalCustom
        open={!!selectedBatch}
        title="Chi tiết lần đồng bộ"
        onCancel={() => setSelectedBatch(null)}
        width={760}
      >
        {selectedBatch && (
          <Space direction="vertical" size={16} className="w-full">
            <Descriptions
              bordered
              size="small"
              column={1}
              items={[
                {
                  key: 'batch',
                  label: 'Batch',
                  children: <Typography.Text code>#{selectedBatch.id_sync_batch}</Typography.Text>,
                },
                {
                  key: 'synced_at',
                  label: 'Thời gian đồng bộ',
                  children: formatDateTime(selectedBatch.synced_at),
                },
                {
                  key: 'total_records',
                  label: 'Tổng bản ghi',
                  children: formatNumber(selectedBatch.total_records),
                },
                {
                  key: 'total_created',
                  label: 'Tạo mới',
                  children: formatNumber(selectedBatch.total_created),
                },
                {
                  key: 'total_updated',
                  label: 'Cập nhật',
                  children: formatNumber(selectedBatch.total_updated),
                },
              ]}
            />

            {selectedSummaryRows.length > 0 ? (
              <Table
                rowKey="key"
                size="small"
                pagination={false}
                dataSource={selectedSummaryRows}
                columns={[
                  {
                    title: 'Nhóm dữ liệu',
                    dataIndex: 'label',
                  },
                  {
                    title: 'Tạo mới',
                    dataIndex: 'created',
                    align: 'right' as const,
                    render: (value: number) => formatNumber(value),
                  },
                  {
                    title: 'Cập nhật',
                    dataIndex: 'updated',
                    align: 'right' as const,
                    render: (value: number) => formatNumber(value),
                  },
                ]}
              />
            ) : (
              <Empty description="Không có summary cho lần đồng bộ này" />
            )}
          </Space>
        )}
      </ModalCustom>
    </div>
  );
};

export default SyncBatchPage;
