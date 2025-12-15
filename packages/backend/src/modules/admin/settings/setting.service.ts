import { prisma } from "../../../lib/prisma";

export class SettingService {
  async get(key: string) {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return setting?.value;
  }

  async set(key: string, value: string, description?: string) {
    return prisma.setting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  async getAll() {
    return prisma.setting.findMany({
      orderBy: { key: "asc" },
    });
  }

  async delete(key: string) {
    return prisma.setting.delete({
      where: { key },
    });
  }

  async getByKeys(keys: string[]) {
    const settings = await prisma.setting.findMany({
      where: { key: { in: keys } },
    });
    return settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }
}

export const settingService = new SettingService();
