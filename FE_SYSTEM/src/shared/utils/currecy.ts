export const formatCurrency = (value?: string | number): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const stringValue = String(value).replace(/[^\d-]/g, '');

  if (!stringValue) {
    return '';
  }

  return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const removeFormatCurrency = (value?: string | number): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  const parsed = value.replace(/[^\d-]/g, '');

  return parsed ? Number(parsed) : 0;
};
