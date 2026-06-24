import CardCustom from '../card/CardCustom';
import TableCustom from './TableCustom';

export interface Pagination {
  total: number;
  page: number;
  limit: number;
}

interface TablePaginationCustomProps<T> {
  columns: any[];
  data: T[];
  loading: boolean;
  pagination: Pagination;
  onChangePage: (page: number, pageSize: number) => void;
  className?: string;
}

const TablePaginationCustom = <T extends object>({
  columns,
  data,
  loading,
  pagination,
  onChangePage,
  className = '',
}: TablePaginationCustomProps<T>) => {
  return (
    <CardCustom className="flex-1">
      <TableCustom<T>
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,

          showSizeChanger: true,

          onChange: (page, pageSize) => {
            onChangePage(page, pageSize);
          },
        }}
        className={`py-2 ${className}`}
      />
    </CardCustom>
  );
};

export default TablePaginationCustom;
