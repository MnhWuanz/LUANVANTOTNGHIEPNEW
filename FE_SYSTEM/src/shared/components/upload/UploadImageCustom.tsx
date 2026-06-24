import { useState } from 'react';

import { uploadApi } from '@/features/upload/api/upload-api';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import { Upload } from 'antd';

import type { UploadFile, UploadProps } from 'antd';

export interface UploadImageCustomProps {
  value?: string;

  onChange?: (value?: string) => void;

  disabled?: boolean;

  type?: 'avatar' | 'banner';
}

const UploadImageCustom = ({
  value,
  onChange,
  disabled,
  type = 'avatar',
}: UploadImageCustomProps) => {
  const [loading, setLoading] = useState(false);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('file', options.file as File);

      const res = await uploadApi.uploadImage(formData);

      const imageUrl = res.data.url;

      onChange?.(imageUrl);

      options.onSuccess?.(res);
    } catch (error) {
      options.onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/');

    if (!isImage) {
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isLt2M) {
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const fileList: UploadFile[] = value
    ? [
        {
          uid: '-1',
          name: 'avatar.png',
          status: 'done',
          url: value,
        },
      ]
    : [];

  return (
    <Upload
      accept="image/*"
      listType={type === 'avatar' ? 'picture-circle' : 'picture-card'}
      maxCount={1}
      customRequest={handleUpload}
      beforeUpload={beforeUpload}
      fileList={type === 'avatar' ? fileList : []}
      disabled={disabled || loading}
      onRemove={() => {
        onChange?.(undefined);
        return true;
      }}
      showUploadList={type === 'avatar'}
      className={type === 'avatar' ? '' : 'upload-banner'}
    >
      {type === 'avatar' ? (
        !value && (
          <div className="flex flex-col items-center justify-center">
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div className="mt-2 text-sm">{loading ? 'Đang tải...' : 'Tải ảnh'}</div>
          </div>
        )
      ) : (
        <div className="w-full">
          <div className="relative w-full overflow-hidden rounded-xl">
            {value ? (
              <>
                <img src={value} alt="banner" className="h-full w-full object-cover" />

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                  <div className="text-white">{loading ? 'Đang tải...' : 'Đổi banner'}</div>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center">
                {loading ? <LoadingOutlined /> : <PlusOutlined />}

                <div className="mt-2 text-sm">{loading ? 'Đang tải...' : 'Tải banner'}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </Upload>
  );
};

export default UploadImageCustom;
