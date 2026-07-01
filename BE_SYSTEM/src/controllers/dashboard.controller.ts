import { Request, Response } from 'express';
import { DashboardService } from 'services/dashboard.service';

const getDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await DashboardService.getDashboard();

    return res.status(200).json({
      success: true,
      message: 'Lay du lieu dashboard thanh cong',
      data: dashboard,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const DashboardController = {
  getDashboard,
};
