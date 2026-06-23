import React from 'react';
import { Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

interface PlaceholderProps {
  title: string;
  iconName: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderProps> = ({ title, iconName, description }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{title}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Hệ thống Điểm danh Khuôn mặt - FaceAttend.</p>
      </div>

      <Card className="rounded-xl shadow-soft-card border border-outline-variant/60 p-8 text-center max-w-2xl mx-auto mt-8 bg-surface-container-lowest">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center text-primary border border-primary-container/20">
            <span className="material-symbols-outlined text-[40px] fill-icon">{iconName}</span>
          </div>
        </div>
        
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">{title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-8">
          {description}
        </p>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            className="rounded-lg h-auto py-2.5 px-6 font-semibold border-outline-variant text-on-surface"
          >
            Quay lại
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/')}
            className="rounded-lg h-auto py-2.5 px-6 font-semibold bg-primary hover:bg-primary-container border-transparent"
          >
            Về Trang chủ
          </Button>
        </div>
      </Card>
    </div>
  );
};
export default PlaceholderPage;
