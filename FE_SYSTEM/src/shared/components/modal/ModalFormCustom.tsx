import { Button, Col, Form, Tabs } from 'antd';
import ModalCustom from '@/shared/components/modal/ModalCustom';
import { useState, useEffect } from 'react';
import { FormFieldType, type FormFieldTypeKey } from '../../types/form-field-type';
import { useNotification } from '../../hooks/useNotification';
import RowCustom from '../row/RowCustom';
import DatePickerCustom from '../datepicker/DatePickerCustom';
import type { UserRole } from '@/features/users/types/user-role-type';
import { useAppSelector } from '@/app/redux/hooks';
import { FormModalMode, type FormModalModeType } from '../../types/form-modal-mode-type';
import SelectCustom from '../select/SelectCustom';
import InputCustom from '../input/InputCustom';
import InputNumberCustom from '../input/InputNumberCustom';
import InputPasswordCustom from '../input/InputPasswordCustom';
import InputTextAreaCustom from '../input/InputTextAreaCustom';
import SelectFetchCustom from '../select/SelectFetchCustom';
import TimePickerCustom from '../timepicker/TimePickerCustom';
import { formatFormValues } from '@/shared/utils/form';

export interface FormContext {
  role: UserRole;
  mode?: FormModalModeType;
}

export interface FormField<T> {
  name: keyof T;

  label: string;

  type: FormFieldTypeKey;

  placeholder?: string;

  disabled?: any;

  rules?: any[];

  options?: {
    label: string;
    value: string | number;
  }[];

  fetchOptions?: () => Promise<any>;

  col?: number;

  props?: any;
}

export interface SectionForm<T> {
  key: string;
  label: string;
  fields: FormField<T>[];
}

interface ModalFormCustomProps<T> {
  open: boolean;

  title: string;

  mode: FormModalModeType;

  initialValues?: Partial<T> | null;

  loading?: boolean;

  sections: SectionForm<T>[];

  disabled?: boolean;

  onCancel: () => void;

  onSuccess: () => void;

  onSubmit: (values: T) => Promise<void>;
}

const ModalFormCustom = <T,>({
  open,
  title,
  mode,
  initialValues,
  sections,
  onCancel,
  onSuccess,
  onSubmit,
  disabled,
}: ModalFormCustomProps<T>) => {
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && initialValues) {
      const formattedValues = formatFormValues(initialValues as T, sections);

      form.setFieldsValue(formattedValues);
    }
  }, [open, initialValues, sections, form]);

  const handleSubmit = async (values: T) => {
    try {
      setLoading(true);

      const formattedValues = formatFormValues(values, sections);

      await onSubmit(formattedValues);

      showNotification('success', 'Thành công', 'Dữ liệu đã được lưu thành công');

      form.resetFields();

      onCancel();

      onSuccess();
    } catch (error: any) {
      showNotification(
        'error',
        'Lỗi',
        error?.response?.data?.message || 'Không thể lưu dữ liệu. Vui lòng thử lại',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <ModalCustom
      open={open}
      title={
        mode === FormModalMode.CREATE
          ? `Thêm ${title.toLowerCase()}`
          : mode === FormModalMode.EDIT
            ? `Cập nhật ${title.toLowerCase()}`
            : `Thông tin ${title.toLowerCase()}`
      }
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tabs
          items={sections.map((section) => ({
            key: section.key,
            label: section.label,
            children: (
              <RowCustom>
                {section.fields
                  .filter((field) => mode === FormModalMode.CREATE || field.name !== 'password') // Nếu EDIT, VIEW THÌ KHÔNG HIỂN THỊ TRƯỜNG PASSWORD
                  .map((field) => (
                    <Col key={field.name as string} span={field.col || 12}>
                      <Form.Item
                        name={field.name as string}
                        label={field.label}
                        rules={field.rules}
                      >
                        {(() => {
                          const isDisabled =
                            typeof field.disabled === 'function'
                              ? field.disabled({ role: user?.role as UserRole, mode })
                              : field.disabled;

                          switch (field.type) {
                            case FormFieldType.Input:
                              return (
                                <InputCustom
                                  placeholder={field.placeholder}
                                  disabled={isDisabled || disabled}
                                  {...field.props}
                                />
                              );
                           
                            case FormFieldType.InputNumber:
                              return (
                                <InputNumberCustom
                                  placeholder={field.placeholder}
                                  disabled={isDisabled || disabled}
                                  {...field.props}
                                />
                              );
                            case FormFieldType.InputPassword:
                              return (
                                <InputPasswordCustom
                                  placeholder={field.placeholder}
                                  disabled={isDisabled || disabled}
                                  {...field.props}
                                />
                              );
                            case FormFieldType.Select:
                              return (
                                <SelectCustom
                                  placeholder={field.placeholder}
                                  options={field.options}
                                  disabled={isDisabled || disabled}
                                  {...field.props}
                                />
                              );
                            case FormFieldType.SelectFetch:
                              return (
                                <SelectFetchCustom
                                  placeholder={field.placeholder}
                                  fetchOptions={field.fetchOptions}
                                  disabled={isDisabled || disabled}
                                  {...field.props}
                                />
                              );
                            case FormFieldType.DatePicker:
                              return (
                                <DatePickerCustom
                                  placeholder={field.placeholder}
                                  disabled={isDisabled || disabled}
                                  {...field.props}
                                />
                              );
                            case FormFieldType.TimePicker:
                              return (
                                <TimePickerCustom
                                  placeholder={field.placeholder}
                                  disabled={isDisabled || disabled}
                                  {...field.props}
                                />
                              );
                            case FormFieldType.TextArea:
                              return (
                                <InputTextAreaCustom
                                  placeholder={field.placeholder}
                                  disabled={isDisabled || disabled}
                                  {...field.props}
                                />
                              );
                            default:
                              return null;
                          }
                        })()}
                      </Form.Item>
                    </Col>
                  ))}
              </RowCustom>
            ),
          }))}
        />

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Hủy</Button>

          <Button type="primary" htmlType="submit" loading={loading} disabled={disabled}>
            Lưu
          </Button>
        </div>
      </Form>
    </ModalCustom>
  );
};

export default ModalFormCustom;
