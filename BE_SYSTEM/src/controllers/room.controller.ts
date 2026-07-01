import { Request, Response } from 'express';
import { RoomService } from 'services/room.service';

const getAllRoom = async (req: Request, res: Response) => {
  const rooms = await RoomService.getAllRoom();

  return res.status(200).json({
    success: true,
    data: rooms,
  });
};

const getAvailableRoomsForKiosk = async (req: Request, res: Response) => {
  const rooms = await RoomService.getAvailableRoomsForKiosk();

  return res.status(200).json({
    success: true,
    data: rooms,
  });
};

export const RoomController = {
  getAllRoom,
  getAvailableRoomsForKiosk,
};
