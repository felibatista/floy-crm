import { Prisma } from "../../../../prisma/generated";
import { prisma } from "../../../lib/prisma";

interface ListEventsParams {
  userId?: number;
  startDate?: string;
  endDate?: string;
  onlyMine?: boolean;
  currentUserId?: number;
}

interface CreateEventData {
  userId: number;
  title: string;
  description?: string | null;
  date: string;
  isAllDay?: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

interface UpdateEventData {
  title?: string;
  description?: string | null;
  date?: string;
  isAllDay?: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export class CalendarService {
  async list(params: ListEventsParams = {}) {
    const { userId, startDate, endDate, onlyMine, currentUserId } = params;

    const where: Prisma.CalendarEventWhereInput = {};

    // If onlyMine is true, filter by current user
    if (onlyMine && currentUserId) {
      where.userId = currentUserId;
    } else if (userId) {
      where.userId = userId;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return events;
  }

  async getById(id: number) {
    return prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async create(data: CreateEventData) {
    return prisma.calendarEvent.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description || null,
        date: new Date(data.date),
        isAllDay: data.isAllDay || false,
        startTime: data.isAllDay ? null : data.startTime || null,
        endTime: data.isAllDay ? null : data.endTime || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateEventData) {
    return prisma.calendarEvent.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        isAllDay: data.isAllDay,
        startTime: data.isAllDay ? null : data.startTime,
        endTime: data.isAllDay ? null : data.endTime,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    return prisma.calendarEvent.delete({
      where: { id },
    });
  }
}

export const calendarService = new CalendarService();
