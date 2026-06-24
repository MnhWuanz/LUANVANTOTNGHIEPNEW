import React from 'react';
import { Select, type SelectProps } from 'antd';

export interface SelectCustomProps extends SelectProps {}

const SelectCustom: React.FC<SelectCustomProps> = ({ ...props }) => {
  return <Select showSearch allowClear placeholder=" " className="w-full min-h-10" {...props} />;
};

export default SelectCustom;
