import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;

  subtitle?: string;

  extra?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, extra }) => {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>

        {subtitle && <p className="mt-1 text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>

      {extra && <div>{extra}</div>}
    </div>
  );
};

export default PageHeader;
