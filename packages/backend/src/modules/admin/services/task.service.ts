import { TaskStatus, TaskPriority, Prisma } from "../../../../prisma/generated";
import { prisma } from "../../../lib/prisma";

interface ListTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  assignedToId?: number;
  projectId?: number;
  category?: string;
  search?: string;
}

interface CreateTaskData {
  title: string;
  description?: string;
  projectId: number;
  ticketId?: number;
  assignedToId?: number;
  category?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: Date;
  endDate?: Date;
  timeEstimated?: string;
  timeSpent?: string;
  includeInChangeLog?: boolean;
}

interface UpdateTaskData extends Partial<CreateTaskData> {}

export class TaskService {
  async list(params: ListTasksParams = {}) {
    const {
      page = 1,
      limit = 50,
      status,
      assignedToId,
      projectId,
      category,
      search,
    } = params;

    const where: Prisma.TaskWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: {
            select: { id: true, name: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          ticket: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        ticket: {
          select: { id: true, title: true },
        },
        commits: true,
      },
    });
  }

  async getByCode(code: string) {
    return prisma.task.findUnique({
      where: { code },
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        ticket: {
          select: { id: true, title: true },
        },
        commits: true,
      },
    });
  }

  private async generateCode(projectId: number): Promise<string> {
    // Get the client slug from the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: { select: { slug: true } },
      },
    });

    if (!project?.client?.slug) {
      throw new Error("Project or client not found");
    }

    // Get slug prefix (uppercase, max 6 chars)
    const slugPrefix = project.client.slug
      .toUpperCase()
      .replace(/-/g, "")
      .slice(0, 6);

    // Count existing tasks for this client to generate sequential number
    const tasksCount = await prisma.task.count({
      where: {
        code: { startsWith: slugPrefix },
      },
    });

    const nextNumber = tasksCount + 1;
    const paddedNumber = nextNumber.toString().padStart(3, "0");

    return `${slugPrefix}-${paddedNumber}`;
  }

  async create(data: CreateTaskData) {
    const code = await this.generateCode(data.projectId);

    return prisma.task.create({
      data: {
        code,
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        ticketId: data.ticketId,
        assignedToId: data.assignedToId,
        category: data.category,
        status: data.status || "pending",
        priority: data.priority || "medium",
        startDate: data.startDate,
        endDate: data.endDate,
        timeEstimated: data.timeEstimated,
        timeSpent: data.timeSpent,
        includeInChangeLog: data.includeInChangeLog,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id: number, data: UpdateTaskData) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        ticket: {
          select: { id: true, title: true },
        },
        commits: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.task.delete({
      where: { id },
    });
  }

  async getCategories() {
    const categories = await prisma.task.findMany({
      where: {
        category: { not: null },
      },
      select: { category: true },
      distinct: ["category"],
    });
    return categories.map((c) => c.category).filter(Boolean);
  }
}

export const taskService = new TaskService();
