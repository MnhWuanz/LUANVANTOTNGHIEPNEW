import { PAGE_DEFAULT, PAGE_LIMIT } from '@/shared/constants/pagination';
import { axiosCilent } from '@/shared/lib/axios';
import type { KioskFilterParams } from '../types/kiosk-filter-params-type';
import type { CreateKioskPayload, Kiosk, KioskActivationCode } from '../types/kiosk-type';

const getLatestActivationCode = (activationCodes?: KioskActivationCode[]) => {
  if (!activationCodes?.length) {
    return null;
  }

  return [...activationCodes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0].code;
};

const normalizeKiosk = (kiosk: Kiosk): Kiosk => ({
  ...kiosk,
  id: kiosk.id_kiosk,
  room_code: kiosk.room?.room_code,
  latestActivationCode: getLatestActivationCode(kiosk.activationCodes),
});

const filterKiosks = (items: Kiosk[], params: KioskFilterParams) => {
  const keySearch = params.keySearch?.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword = keySearch
      ? [
          item.device_code,
          item.device_name,
          item.room_code,
          item.room?.room_code,
          String(item.latestActivationCode ?? ''),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keySearch))
      : true;

    const matchesStatus = params.status ? item.status === params.status : true;

    return matchesKeyword && matchesStatus;
  });
};

export const kioskRoleAdminApi = {
  getAll: async (params: KioskFilterParams) => {
    const res = await axiosCilent.get('/kiosks', { params });
    const kiosks = Array.isArray(res.data.data) ? res.data.data.map(normalizeKiosk) : [];
    const filteredKiosks = filterKiosks(kiosks, params);
    const page = Number(params.page || PAGE_DEFAULT);
    const limit = Number(params.limit || PAGE_LIMIT);
    const start = (page - 1) * limit;

    return {
      ...res.data,
      data: {
        items: filteredKiosks.slice(start, start + limit),
        pagination: {
          total: filteredKiosks.length,
          page,
          limit,
        },
      },
    };
  },

  create: async (payload: CreateKioskPayload) => {
    const res = await axiosCilent.post('/kiosks/generate-code', payload);

    return res.data;
  },

  delete: async (id_kiosk: number) => {
    const res = await axiosCilent.delete(`/kiosks/${id_kiosk}/delete`);

    return res.data;
  },
};
