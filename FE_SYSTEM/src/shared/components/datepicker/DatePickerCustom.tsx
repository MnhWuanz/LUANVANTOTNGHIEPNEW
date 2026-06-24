import { DatePicker, type DatePickerProps } from 'antd';
import { FORMAT_DATE } from '../../constants/format-date';

interface DatePickerCustomProps extends DatePickerProps {}

const DatePickerCustom = ({ ...props }: DatePickerCustomProps) => {
  return <DatePicker format={FORMAT_DATE} className="w-full min-h-10" {...props} />;
};

export default DatePickerCustom;
