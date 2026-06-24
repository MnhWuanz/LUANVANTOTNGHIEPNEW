import { useState } from 'react';
import { FormModalMode, type FormModalModeType } from '../types/form-modal-mode-type';

export const useFormModal = <T>() => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FormModalModeType>(FormModalMode.CREATE);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

  const openCreate = () => {
    setMode(FormModalMode.CREATE);
    setSelectedRecord(null);
    setOpen(true);
  };

  const openView = (item: T) => {
    setMode(FormModalMode.VIEW);
    setSelectedRecord(item);
    setOpen(true);
  };

  const openEdit = (item: T) => {
    setMode(FormModalMode.EDIT);
    setSelectedRecord(item);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  return {
    open,
    mode,
    selectedRecord,

    openCreate,
    openView,
    openEdit,
    close,

    setSelectedRecord,
  };
};
