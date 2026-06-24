import { App } from 'antd';

export const useNotification = () => {
  const { notification } = App.useApp();

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    description?: string,
  ) => {
    notification[type]({
      message: title,
      description,
    });
  };

  return {
    showNotification,
  };
};
