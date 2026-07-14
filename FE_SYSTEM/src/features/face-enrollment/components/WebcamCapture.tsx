import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button, Space, Typography, Alert } from 'antd';
import {isMobile} from 'react-device-detect';
import {
  CameraOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface WebcamCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  loading?: boolean;
  disabled?: boolean;
}

const videoConstraints = {
  width: { ideal: 720 },
  height: { ideal: 720 },
  facingMode: isMobile ? {exact: "environment"} : 'user',
};

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  loading = false,
  disabled = false,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);

    const response = await fetch(imageSrc);
    const blob = await response.blob();
    setCapturedBlob(blob);
  }, []);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setCapturedBlob(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (capturedBlob) {
      onCapture(capturedBlob);
    }
  }, [capturedBlob, onCapture]);

  const handleCameraError = useCallback(() => {
    setCameraError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera của trình duyệt.');
  }, []);

  if (cameraError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Lỗi camera"
        description={cameraError}
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
    <div className="text-center">
      <div className="mb-4 flex w-full justify-center">
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            aspectRatio: '1 / 1',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            background: '#f5f5f5',
          }}
        >
          {capturedImage ? (
            <>
              <img
                src={capturedImage}
                alt="Ảnh khuôn mặt đã chụp"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(82, 196, 26, 0.9)',
                  color: '#fff',
                  padding: '4px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <CheckCircleOutlined /> Đã chụp ảnh
              </div>
            </>
          ) : (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.92}
                videoConstraints={videoConstraints}
                onUserMediaError={handleCameraError}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    width: '58%',
                    height: '74%',
                    border: '3px dashed rgba(24, 144, 255, 0.65)',
                    borderRadius: '50%',
                  }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.55)',
                  color: '#fff',
                  padding: '4px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                Đặt khuôn mặt vào khung hình
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto mb-3 max-w-[480px] px-1">
        <Text type="secondary" style={{ fontSize: 13 }}>
          Nhìn thẳng vào camera, đảm bảo ánh sáng đầy đủ và không đeo kính râm.
        </Text>
      </div>

      <Space size="middle" wrap className="w-full justify-center">
        {capturedImage ? (
          <>
            <Button
              className="w-full sm:w-auto"
              icon={<ReloadOutlined />}
              onClick={handleRetake}
              disabled={loading}
              size="large"
            >
              Chụp lại
            </Button>
            <Button
              className="w-full sm:w-auto"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleConfirm}
              loading={loading}
              disabled={disabled || !capturedBlob}
              size="large"
            >
              Xác nhận đăng ký
            </Button>
          </>
        ) : (
          <Button
            className="w-full min-w-[220px] sm:w-auto"
            type="primary"
            icon={<CameraOutlined />}
            onClick={handleCapture}
            disabled={disabled}
            size="large"
            style={{
              height: 48,
              paddingInline: 32,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Chụp ảnh khuôn mặt
          </Button>
        )}
      </Space>
    </div>
  );
};

export default WebcamCapture;
