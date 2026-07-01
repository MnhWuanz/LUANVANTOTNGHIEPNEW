import { Button } from 'antd';

import ModalCustom from './ModalCustom';

interface ModalConfirmProps {
  open: boolean;

  title?: string;

  description?: string;

  loading?: boolean;

  onCancel: () => void;

  onConfirm: () => void;
}

const ModalConfirm = ({
  open,
  title = 'Xác nhận',
  description = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  loading = false,
  onCancel,
  onConfirm,
}: ModalConfirmProps) => {
  return (
    <ModalCustom open={open} title={title} onCancel={onCancel} footer={null} width={400}>
      <p className="mb-6 text-gray-500 dark:text-gray-400">{description}</p>

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Hủy</Button>

        <Button danger type="primary" loading={loading} onClick={onConfirm}>
          Xác nhận
        </Button>
      </div>
    </ModalCustom>
  );
};

export default ModalConfirm;
