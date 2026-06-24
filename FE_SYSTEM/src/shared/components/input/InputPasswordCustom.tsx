import type { InputProps } from 'antd';
import { Input } from 'antd';

export interface InputPasswordCustomProps extends InputProps {}

const InputPasswordCustom: React.FC<InputPasswordCustomProps> = ({ ...props }) => {
  return <Input.Password placeholder=" " className="min-h-10 w-full!" {...props} />;
};

export default InputPasswordCustom;
