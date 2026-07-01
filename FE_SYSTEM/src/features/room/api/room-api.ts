import { axiosCilent } from '@/shared/lib/axios';

export interface RoomOption {
  id_room: number;
  room_code: string;
  capacity?: number;
}

const toRoomSelectOptions = (rooms: RoomOption[]) =>
  rooms.map((room) => ({
    label: room.capacity ? `${room.room_code} - ${room.capacity} chỗ` : room.room_code,
    value: room.id_room,
  }));

export const getAllRoom = async () => {
  const res = await axiosCilent.get('/rooms');

  return res.data;
};

export const getAvailableRoomsForKioskOptions = async () => {
  const res = await axiosCilent.get('/rooms/available-for-kiosk');
  const rooms = Array.isArray(res.data.data) ? res.data.data : [];

  return toRoomSelectOptions(rooms);
};
