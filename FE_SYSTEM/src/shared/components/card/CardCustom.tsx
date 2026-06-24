import { Card } from 'antd';
import React from 'react';

interface CardCustomProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const CardCustom: React.FC<CardCustomProps> = ({ title, children, className }) => {
  return (
    <Card title={title} className={`rounded-xl ${className}`}>
      {children}
    </Card>
  );
};

export default CardCustom;
