import { TimePicker, type TimePickerProps } from 'antd';
import { FORMAT_TIME } from '../../constants/format-date';

interface TimePickerCustomProps extends TimePickerProps {}

const TimePickerCustom = ({ ...props }: TimePickerCustomProps) => {
  return <TimePicker format={FORMAT_TIME} className="w-full min-h-10" {...props} />;
};

export default TimePickerCustom;
