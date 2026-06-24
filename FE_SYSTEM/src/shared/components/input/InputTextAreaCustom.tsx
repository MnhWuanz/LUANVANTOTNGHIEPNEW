import { Input } from 'antd';

import type { TextAreaProps } from 'antd/es/input';

export interface InputTextAreaCustomProps extends TextAreaProps {}

const InputTextAreaCustom: React.FC<InputTextAreaCustomProps> = ({ ...props }) => {
  return <Input.TextArea placeholder=" " className="min-h-10 w-full!" {...props} />;
};

export default InputTextAreaCustom;
