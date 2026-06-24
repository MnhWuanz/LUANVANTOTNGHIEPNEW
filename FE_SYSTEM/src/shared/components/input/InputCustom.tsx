import type { InputProps } from 'antd';
import { Input } from 'antd';

export interface InputCustomProps extends InputProps {}

const InputCustom: React.FC<InputCustomProps> = ({ ...props }) => {
  return <Input placeholder=" " className="min-h-10 w-full!" {...props} />;
};

export default InputCustom;
