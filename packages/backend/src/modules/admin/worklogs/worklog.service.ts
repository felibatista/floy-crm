import { WorkLogType, Prisma } from "../../../../prisma/generated";
import { prisma } from "../../../lib/prisma";

interface ListWorkLogsParams {
  taskId: number;
  page?: number;
  limit?: number;
}

interface CreateWorkLogData {
  taskId: number;
  userId: number;
  summary: string;
  hours: number;
  minutes?: number;
  type?: WorkLogType;
  dateWorked?: Date;
}

interface UpdateWorkLogData {
  summary?: string;
  hours?: number;
  minutes?: number;
  type?: WorkLogType;
  dateWorked?: Date;
}

export class WorkLogService {
  async list(params: ListWorkLogsParams) {
    const { taskId, page = 1, limit = 50 } = params;

    const where: Prisma.WorkLogWhereInput = { taskId };

    const [workLogs, total] = await Promise.all([
      prisma.workLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.workLog.count({ where }),
    ]);

    return {
      data: workLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    return prisma.workLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        task: {
          select: { id: true, code: true, title: true },
        },
      },
    });
  }

  async create(data: CreateWorkLogData) {
    return prisma.workLog.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        summary: data.summary,
        hours: data.hours,
        minutes: data.minutes || 0,
        type: data.type || "desarrollo",
        dateWorked: data.dateWorked || new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id: number, data: UpdateWorkLogData) {
    return prisma.workLog.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async delete(id: number) {
    return prisma.workLog.delete({
      where: { id },
    });
  }

  // Calcula el tiempo total dedicado a una tarea (retorna formato HH:MM)
  async getTotalTimeByTask(taskId: number) {
    const workLogs = await prisma.workLog.findMany({
      where: { taskId },
      select: { hours: true, minutes: true },
    });

    let totalMinutes = 0;
    for (const log of workLogs) {
      totalMinutes += log.hours * 60 + log.minutes;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      hours,
      minutes,
      totalMinutes,
      formatted: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    };
  }

  // Obtiene estadísticas de trabajo por tarea
  async getStatsByTask(taskId: number) {
    const workLogs = await prisma.workLog.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { dateWorked: "desc" },
    });

    const totalTime = await this.getTotalTimeByTask(taskId);

    // Agrupar por tipo de trabajo
    const byType: Record<string, number> = {};
    for (const log of workLogs) {
      const minutes = log.hours * 60 + log.minutes;
      byType[log.type] = (byType[log.type] || 0) + minutes;
    }

    // Agrupar por usuario
    const byUser: Record<string, { name: string; minutes: number }> = {};
    for (const log of workLogs) {
      const minutes = log.hours * 60 + log.minutes;
      const userId = log.user.id.toString();
      if (!byUser[userId]) {
        byUser[userId] = { name: log.user.name, minutes: 0 };
      }
      byUser[userId].minutes += minutes;
    }

    return {
      totalTime,
      totalEntries: workLogs.length,
      byType,
      byUser,
      lastEntry: workLogs[0] || null,
    };
  }
}

export const workLogService = new WorkLogService();
