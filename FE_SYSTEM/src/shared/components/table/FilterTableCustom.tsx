import { Button, Col } from 'antd';

import type { Dayjs } from 'dayjs';
import { FormFieldType, type FormFieldTypeKey } from '@/shared/types/form-field-type';
import { ReloadOutlined } from '@ant-design/icons';
import RowCustom from '../row/RowCustom';
import InputCustom from '../input/InputCustom';
import SelectCustom from '../select/SelectCustom';
import DatePickerCustom from '../datepicker/DatePickerCustom';
import CardCustom from '../card/CardCustom';
import SelectFetchCustom from '../select/SelectFetchCustom';
import { formatDateToPicker, formatDateToQuery } from '@/shared/utils/date';

export interface DataFilter {
  name: string;

  label?: string;

  type: FormFieldTypeKey;

  placeholder?: string;

  options?: {
    label: string;
    value: string | number;
  }[];

  fetchOptions?: () => Promise<any>;
}

interface FilterTableCustomProps {
  dataFilters: DataFilter[];

  values: Record<string, any>;

  onChange: (values: Record<string, any>) => void;

  onReset?: () => void;

  onSubmit?: () => void;
}

const FilterTableCustom = ({
  dataFilters,
  values,
  onChange,
  onReset,
  onSubmit,
}: FilterTableCustomProps) => {
  const handleChange = (name: string, value: any) => {
    onChange({
      ...values,
      [name]: value,
    });
  };

  return (
    <CardCustom>
      <RowCustom>
        <div className="flex flex-col w-full gap-4">
          <div className="flex items-end justify-end">
            <Button onClick={onReset} className="h-10!">
              <ReloadOutlined />
            </Button>
          </div>

          <div className="flex w-full flex-wrap">
            {dataFilters.map((filter) => (
              <Col span={8} key={filter.name} className="mb-4">
                {(() => {
                  switch (filter.type) {
                    case FormFieldType.Input:
                      return (
                        <InputCustom
                          placeholder={filter.placeholder}
                          value={values[filter.name]}
                          onChange={(e) => handleChange(filter.name, e.target.value)}
                        />
                      );
                    case FormFieldType.Select:
                      return (
                        <SelectCustom
                          allowClear
                          placeholder={filter.placeholder}
                          options={filter.options}
                          value={values[filter.name]}
                          onChange={(value) => handleChange(filter.name, value)}
                        />
                      );
                    case FormFieldType.SelectFetch:
                      return (
                        <SelectFetchCustom
                          placeholder={filter.placeholder}
                          fetchOptions={filter.fetchOptions}
                          value={values[filter.name]}
                          onChange={(value) => handleChange(filter.name, value)}
                        />
                      );
                    case FormFieldType.DatePicker:
                      return (
                        <DatePickerCustom
                          placeholder={filter.placeholder}
                          value={formatDateToPicker(values[filter.name])}
                          onChange={(value) =>
                            handleChange(filter.name, formatDateToQuery(value as Dayjs))
                          }
                        />
                      );
                    default:
                      return null;
                  }
                })()}
              </Col>
            ))}
          </div>

          <div className="flex justify-center">
            <Button type="primary" size="large" onClick={onSubmit}>
              Tìm kiếm
            </Button>
          </div>
        </div>
      </RowCustom>
    </CardCustom>
  );
};

export default FilterTableCustom;
