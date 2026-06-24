import { Button, Popconfirm, Space, Tooltip } from 'antd';
import type { ReactNode } from 'react';

export interface TableAction<T> {
  show: (record: T) => boolean;
  icon: ReactNode;
  tooltip?: string;
  type?: 'link' | 'text' | 'primary' | 'default';
  danger?: boolean;
  confirmText?: string;
  onClick: (record: T) => void;
  isPopconfirm?: boolean;
  color?: string;
}

interface ActionGroupProps<T> {
  record: T;
  actions: TableAction<T>[];
}

const ActionGroup = <T,>({ record, actions }: ActionGroupProps<T>) => {
  return (
    <Space>
      {actions
        .filter((action) => action.show(record))
        .map((action, index) => {
          const button = (
            <Button
              type={action.type || 'link'}
              danger={action.danger}
              icon={
                action.color ? (
                  <span style={{ color: action.color }}>{action.icon}</span>
                ) : (
                  action.icon
                )
              }
              onClick={() => (action.isPopconfirm ? undefined : action.onClick(record))}
            />
          );

          return (
            <Tooltip key={index} title={action.tooltip}>
              {action.isPopconfirm ? (
                <Popconfirm
                  title={'Bạn có chắc chắn thực hiện hành động này?'}
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => action.onClick(record)}
                >
                  {button}
                </Popconfirm>
              ) : (
                button
              )}
            </Tooltip>
          );
        })}
    </Space>
  );
};

export default ActionGroup;
