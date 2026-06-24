import { formatCurrency, removeFormatCurrency } from '@/shared/utils/currecy';
import type { InputNumberProps } from 'antd';
import { InputNumber } from 'antd';

export interface InputNumberCustomProps extends InputNumberProps {
  isCurrency?: boolean;
}

const InputNumberCustom: React.FC<InputNumberCustomProps> = ({ isCurrency, ...props }) => {
  return (
    <InputNumber
      placeholder=" "
      className="min-h-10 w-full!"
      formatter={isCurrency ? formatCurrency : undefined}
      parser={isCurrency ? (value) => removeFormatCurrency(value).toString() : undefined}
      {...props}
    />
  );
};
export default InputNumberCustom;
