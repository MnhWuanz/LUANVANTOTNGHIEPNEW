import { Request, Response } from 'express';
import { KioskService } from 'services/kiosk.service';

const KIOSK_ERROR_RESPONSE: Record<
  string,
  { status: number; message: string }
> = {
  ROOM_NOT_FOUND: { status: 404, message: 'Phong khong ton tai' },
  ROOM_ALREADY_HAS_KIOSK: { status: 409, message: 'Phong nay da co kiosk' },
  ACTIVATION_CODE_GENERATION_FAILED: {
    status: 500,
    message: 'Khong the tao ma kich hoat kiosk',
  },
  INVALID_ACTIVATION_CODE: {
    status: 400,
    message: 'Ma kich hoat khong hop le',
  },
  ACTIVATION_CODE_NOT_FOUND: {
    status: 404,
    message: 'Ma kich hoat khong ton tai',
  },
  ACTIVATION_CODE_ALREADY_USED: {
    status: 409,
    message: 'Ma kich hoat da duoc su dung',
  },
  KIOSK_NOT_FOUND: { status: 404, message: 'Kiosk khong ton tai' },
  KIOSK_BLOCKED: { status: 403, message: 'Kiosk da bi khoa' },
  KIOSK_ALREADY_ACTIVE: { status: 409, message: 'Kiosk da duoc kich hoat' },
};

function sendKioskError(error: unknown, res: Response) {
  const code = error instanceof Error ? error.message : '';
  const response = KIOSK_ERROR_RESPONSE[code];

  if (response) {
    return res.status(response.status).json({
      success: false,
      message: response.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

const createKioskCode = async (req: Request, res: Response) => {
  try {
    const { device_name, id_room } = req.body;

    if (!device_name || !id_room) {
      return res.status(400).json({
        success: false,
        message: 'device_name va id_room la bat buoc',
      });
    }

    const result = await KioskService.createKioskCode({
      device_name,
      id_room: Number(id_room),
    });

    return res.status(201).json({
      success: true,
      message: 'Tao ma kiosk thanh cong',
      data: result,
    });
  } catch (error) {
    return sendKioskError(error, res);
  }
};

const getAllKiosk = async (req: Request, res: Response) => {
  try {
    const kiosks = await KioskService.getAllKiosk();
    return res.status(200).json({
      success: true,
      message: 'Lay danh sach kiosk thanh cong',
      data: kiosks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const activateKiosk = async (req: Request, res: Response) => {
  try {
    const code = String(req.body.code ?? '').trim();

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'code la bat buoc',
      });
    }

    const result = await KioskService.activateKiosk(code);

    return res.status(200).json({
      success: true,
      message: 'Kich hoat kiosk thanh cong',
      data: result,
    });
  } catch (error) {
    return sendKioskError(error, res);
  }
};
const deleteKisosk = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id_kiosk);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Không có id của thiết bị',
      });
    }

    const result = await KioskService.deleteKiosk(Number(id));

    return res.status(200).json({
      success: true,
      message: 'Xoa kiosk thanh cong',
      data: result,
    });
  } catch (error) {
    return sendKioskError(error, res);
  }
};
export const KioskController = {
  createKioskCode,
  getAllKiosk,
  activateKiosk,
  deleteKisosk,
};
