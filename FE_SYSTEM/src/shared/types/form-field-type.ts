export const FormFieldType = {
  Input: 'input',
  InputNumber: 'inputNumber',
  InputPassword: 'inputPassword',
  Select: 'select',
  SelectFetch: 'selectFetch',
  TimePicker: 'timePicker',
  Checkbox: 'checkbox',
  DatePicker: 'datePicker',
  ImageUpload: 'imageUpload',
  TextArea: 'textArea',
} as const;

export type FormFieldTypeKey = (typeof FormFieldType)[keyof typeof FormFieldType];
