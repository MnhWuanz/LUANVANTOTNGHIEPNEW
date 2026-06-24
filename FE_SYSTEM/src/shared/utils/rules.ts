import type { Rule } from 'antd/es/form';

type KeyUnion = 'email' | 'phone' | 'password';

export const rules: Record<KeyUnion, Rule> = {
  email: {
    validator: (_, value) => {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

      if (!value?.trim()) {
        return Promise.resolve();
      }

      if (!emailRegex.test(value.trim())) {
        return Promise.reject(new Error('Email không hợp lệ'));
      }

      return Promise.resolve();
    },
  },
  phone: {
    pattern: /^[0-9]{10,11}$/,

    message: 'Số điện thoại không hợp lệ',
  },

  password: {
    validator: (_, value) => {
      /* Tối thiểu 6 ký tự */
      const passwordRegex = /^.{6,}$/;

      if (value && !passwordRegex.test(value)) {
        return Promise.reject(new Error('Mật khẩu không hợp lệ (Tối thiểu 6 ký tự)'));
      }

      // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

      // if (value && !passwordRegex.test(value)) {
      //   return Promise.reject(
      //     new Error(
      //       'Mật khẩu không hợp lệ (Tối thiểu 8 ký tự, ít nhất một chữ cái viết hoa, một chữ cái viết thường và một ký tự đặc biệt)',
      //     ),
      //   );
      // }

      return Promise.resolve();
    },
  },
};
