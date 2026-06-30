import { useAppSelector, useAppDispatch } from '@/app/redux/hooks';
import { Button, Col, Flex, Form } from 'antd';
import { generalInfoFormFields } from '../contants/general-info-form-fields';
import CardCustom from '@/shared/components/card/CardCustom';
import type { User } from '../types/user-type';
import { useEffect } from 'react';
import { getMeThunk } from '@/features/auth/store/auth-thunk';
import { useNotification } from '@/shared/hooks/useNotification';
import { FormFieldType } from '@/shared/types/form-field-type';
import RowCustom from '@/shared/components/row/RowCustom';
import InputCustom from '@/shared/components/input/InputCustom';

import InputPasswordCustom from '@/shared/components/input/InputPasswordCustom';

import { userRoleTeacherApi } from '../api/user-api';

const GeneralInfoTab = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { showNotification } = useNotification();

  const { updateTeacher } = userRoleTeacherApi;

  const [form] = Form.useForm();

  const onFinish = async (values: User) => {
    try {
      const res = await updateTeacher(values);

      dispatch(getMeThunk());

      showNotification(
        'success',
        'Cập nhật thành công',
        res.message || 'Thông tin cá nhân đã được cập nhật thành công',
      );
    } catch (error: any) {
      showNotification(
        'error',
        'Cập nhật thất bại',
        error?.response?.data?.message || 'Đã có lỗi xảy ra khi cập nhật thông tin cá nhân',
      );
    }
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
        full_name: user.teacher?.full_name || user.full_name,
      });
    }
  }, [user, form]);

  if (!user) return null;

  return (
    <Flex vertical gap={16}>
      <CardCustom title="Thông tin cá nhân">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <RowCustom>
            {generalInfoFormFields
              .map((field) => (
                <Col key={field.name} span={field.col || 12}>
                  <Form.Item label={field.label} name={field.name} rules={field.rules}>
                    {(() => {
                      switch (field.type) {
                        case FormFieldType.Input:
                          return <InputCustom placeholder={field.placeholder} />;
                        case FormFieldType.InputPassword:
                          return <InputPasswordCustom placeholder={field.placeholder} />;
                        default:
                          return null;
                      }
                    })()}
                  </Form.Item>
                </Col>
              ))}
          </RowCustom>

          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </Form>
      </CardCustom>
    </Flex>
  );
};

export default GeneralInfoTab;
