import { Table } from 'antd';

import type { TableProps } from 'antd';

interface TableCustomProps<T> extends TableProps<T> {}

const TableCustom = <T extends object>({ ...props }: TableCustomProps<T>) => {
  return <Table rowKey="id" pagination={false} scroll={{ x: 'max-content' }} {...props} />;
};

export default TableCustom;
