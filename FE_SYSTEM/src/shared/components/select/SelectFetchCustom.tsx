import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';

export interface SelectFetchCustomProps extends SelectProps {
  fetchOptions?: () => Promise<any>;
}

const SelectFetchCustom: React.FC<SelectFetchCustomProps> = ({ fetchOptions, ...props }) => {
  const [options, setOptions] = useState<SelectProps['options']>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!fetchOptions) return;
    setLoading(true);

    try {
      const data = await fetchOptions();
      setOptions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Select
      showSearch={{ optionFilterProp: 'label' }}
      allowClear
      notFoundContent={loading ? <Spin size="small" /> : 'Không có dữ liệu'}
      options={options}
      className="w-full min-h-10"
      {...props}
    />
  );
};

export default SelectFetchCustom;
