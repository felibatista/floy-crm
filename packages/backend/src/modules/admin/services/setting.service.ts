import { prisma } from "../../../lib/prisma";

export class SettingService {
  async getAllSettings() {
    return await prisma.setting.findMany({
      orderBy: { key: "asc" },
    });
  }

  async getSettingByKey(key: string) {
    return await prisma.setting.findUnique({ where: { key } });
  }

  async createSetting(data: {
    key: string;
    value: string;
    description?: string;
  }) {
    return await prisma.setting.create({
      data,
    });
  }

  async updateSetting(key: string, value: string) {
    return await prisma.setting.update({
      where: { key },
      data: { value },
    });
  }

  async deleteSetting(key: string) {
    const setting = await prisma.setting.findUnique({ where: { key } });

    if (!setting) {
      throw new Error("Setting not found");
    }

    if (setting.isSystem) {
      throw new Error("Cannot delete a system setting");
    }

    return await prisma.setting.delete({
      where: { key },
    });
  }
}
