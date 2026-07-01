import { prisma } from 'config/client';

const ROOM_OPTION_SELECT = {
  id_room: true,
  room_code: true,
  capacity: true,
} as const;

const getAllRoom = async () => {
  return prisma.room.findMany({
    select: ROOM_OPTION_SELECT,
    orderBy: {
      room_code: 'asc',
    },
  });
};

const getAvailableRoomsForKiosk = async () => {
  return prisma.room.findMany({
    where: {
      kiosk: {
        is: null,
      },
    },
    select: ROOM_OPTION_SELECT,
    orderBy: {
      room_code: 'asc',
    },
  });
};

export const RoomService = {
  getAllRoom,
  getAvailableRoomsForKiosk,
};
