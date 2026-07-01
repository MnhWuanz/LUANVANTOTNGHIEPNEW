import { prisma } from 'config/client';
import { randomInt } from 'crypto';

function generateActivationCode() {
  return randomInt(100000, 1000000);
}

function generateDeviceCode(idRoom: number) {
  return `KIOSK-${idRoom}-${randomInt(1000, 10000)}`;
}

async function generateUniqueActivationCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateActivationCode();
    const existedCode = await prisma.activation_Code.findUnique({
      where: { code },
      select: { id_activation_code: true },
    });

    if (!existedCode) {
      return code;
    }
  }

  throw new Error('ACTIVATION_CODE_GENERATION_FAILED');
}

const createKioskCode = async (data: {
  device_name: string;
  id_room: number;
}) => {
  const room = await prisma.room.findUnique({
    where: { id_room: data.id_room },
  });

  if (!room) {
    throw new Error('ROOM_NOT_FOUND');
  }

  const existedKiosk = await prisma.kiosk.findUnique({
    where: { id_room: data.id_room },
  });

  if (existedKiosk) {
    throw new Error('ROOM_ALREADY_HAS_KIOSK');
  }

  const activationCodeValue = await generateUniqueActivationCode();

  return prisma.$transaction(async (tx) => {
    const kiosk = await tx.kiosk.create({
      data: {
        device_code: generateDeviceCode(data.id_room),
        device_name: data.device_name,
        id_room: data.id_room,
        status: 'PENDING',
        is_active: false,
      },
    });

    const activationCode = await tx.activation_Code.create({
      data: {
        code: activationCodeValue,
        is_active: true,
        is_used: false,
        id_kiosk: kiosk.id_kiosk,
      },
    });

    return {
      kiosk,
      activation_code: activationCode.code,
    };
  });
};

const getAllKiosk = async () => {
  return prisma.kiosk.findMany({
    include: {
      room: true,
      activationCodes: true,
    },
  });
};

const activateKiosk = async (code: number) => {
  if (!Number.isInteger(code) || code < 100000 || code > 999999) {
    throw new Error('INVALID_ACTIVATION_CODE');
  }

  const activationCode = await prisma.activation_Code.findUnique({
    where: { code },
    include: {
      kiosk: {
        include: {
          room: true,
        },
      },
    },
  });

  if (!activationCode) {
    throw new Error('ACTIVATION_CODE_NOT_FOUND');
  }

  if (!activationCode.id_kiosk || !activationCode.kiosk) {
    throw new Error('KIOSK_NOT_FOUND');
  }

  if (activationCode.kiosk.status === 'BLOCKED') {
    throw new Error('KIOSK_BLOCKED');
  }

  if (activationCode.kiosk.status === 'ACTIVE' || activationCode.kiosk.is_active) {
    throw new Error('KIOSK_ALREADY_ACTIVE');
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const consumedCode = await tx.activation_Code.updateMany({
      where: {
        id_activation_code: activationCode.id_activation_code,
        is_active: true,
        is_used: false,
      },
      data: {
        is_active: false,
        is_used: true,
      },
    });

    if (consumedCode.count === 0) {
      throw new Error('ACTIVATION_CODE_ALREADY_USED');
    }

    const kiosk = await tx.kiosk.update({
      where: { id_kiosk: activationCode.id_kiosk },
      data: {
        status: 'ACTIVE',
        is_active: true,
        activated_at: now,
        last_seen_at: now,
      },
      include: {
        room: true,
      },
    });

    return {
      kiosk,
      activated_at: now,
    };
  });
};

export const KioskService = {
  createKioskCode,
  getAllKiosk,
  activateKiosk,
};
