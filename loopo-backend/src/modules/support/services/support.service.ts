import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import {
  FilterTicketsDto,
  ReplyTicketDto,
  AddNoteDto,
  UpdateTicketStatusDto,
  UpdateTicketPriorityDto,
  AssignAgentDto,
  EscalateTicketDto
} from '../dto/support.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async listTickets(filters: FilterTicketsDto) {
    const { status, priority, category, channel, agent, search, skip, take } = filters;

    const where: Prisma.SupportTicketWhereInput = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category && category !== 'All Categories') where.category = category;
    if (channel) where.channel = channel;
    if (agent && agent !== 'All Agents') where.assignedAgent = agent;

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { userPhone: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, tickets] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : 50,
      }),
    ]);

    return { total, tickets };
  }

  async getTicketStats() {
    const [total, open, inProgress, waiting, resolved, closed] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({ where: { status: 'WAITING_FOR_USER' } }),
      this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
    ]);

    return {
      total,
      open,
      pending: inProgress + waiting,
      resolved,
      closed
    };
  }

  async getTicketById(id: string) {
    // Support lookup by UUID or by ticketNumber (e.g. TKT-0001254)
    const isTicketNumber = id.startsWith('TKT-') || id.startsWith('#TKT-');
    const cleanNumber = id.replace('#', '');

    const ticket = await this.prisma.supportTicket.findFirst({
      where: isTicketNumber ? { ticketNumber: cleanNumber } : { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        internalNotes: { orderBy: { createdAt: 'desc' } },
        activityLogs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Support ticket with identifier ${id} not found`);
    }

    return ticket;
  }

  async sendReply(id: string, dto: ReplyTicketDto, senderName = 'Admin User', senderId?: string) {
    const ticket = await this.getTicketById(id);

    const [newMessage] = await this.prisma.$transaction([
      this.prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: senderId || null,
          senderType: 'AGENT',
          senderName,
          message: dto.message,
          attachments: dto.attachments || Prisma.JsonNull,
        },
      }),
      this.prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          lastReplyAt: new Date(),
          status: ticket.status === 'CLOSED' ? 'IN_PROGRESS' : ticket.status,
        },
      }),
      this.prisma.ticketActivityLog.create({
        data: {
          ticketId: ticket.id,
          operator: senderName,
          action: dto.attachments && dto.attachments.length > 0
            ? `Agent replied with ${dto.attachments.length} attachment(s)`
            : 'Agent replied to customer message',
        },
      }),
    ]);

    return newMessage;
  }

  async addInternalNote(id: string, dto: AddNoteDto, authorName = 'Admin User', authorId?: string) {
    const ticket = await this.getTicketById(id);

    const [newNote] = await this.prisma.$transaction([
      this.prisma.ticketInternalNote.create({
        data: {
          ticketId: ticket.id,
          authorId: authorId || null,
          authorName,
          note: dto.note,
        },
      }),
      this.prisma.ticketActivityLog.create({
        data: {
          ticketId: ticket.id,
          operator: authorName,
          action: 'Private internal note added',
        },
      }),
    ]);

    return newNote;
  }

  async updateStatus(id: string, dto: UpdateTicketStatusDto, operator = 'Admin User') {
    const ticket = await this.getTicketById(id);

    const [updatedTicket] = await this.prisma.$transaction([
      this.prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: dto.status },
      }),
      this.prisma.ticketActivityLog.create({
        data: {
          ticketId: ticket.id,
          operator,
          action: `Ticket status updated to ${dto.status}`,
        },
      }),
    ]);

    return updatedTicket;
  }

  async updatePriority(id: string, dto: UpdateTicketPriorityDto, operator = 'Admin User') {
    const ticket = await this.getTicketById(id);

    const [updatedTicket] = await this.prisma.$transaction([
      this.prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { priority: dto.priority },
      }),
      this.prisma.ticketActivityLog.create({
        data: {
          ticketId: ticket.id,
          operator,
          action: `Ticket priority changed to ${dto.priority}`,
        },
      }),
    ]);

    return updatedTicket;
  }

  async assignAgent(id: string, dto: AssignAgentDto, operator = 'Admin User') {
    const ticket = await this.getTicketById(id);

    const [updatedTicket] = await this.prisma.$transaction([
      this.prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { assignedAgent: dto.agentName },
      }),
      this.prisma.ticketActivityLog.create({
        data: {
          ticketId: ticket.id,
          operator,
          action: `Ticket assigned to ${dto.agentName}`,
        },
      }),
    ]);

    return updatedTicket;
  }

  async escalateTicket(id: string, dto: EscalateTicketDto, operator = 'Admin User') {
    const ticket = await this.getTicketById(id);

    const [updatedTicket] = await this.prisma.$transaction([
      this.prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { priority: 'URGENT', status: 'IN_PROGRESS' },
      }),
      this.prisma.ticketInternalNote.create({
        data: {
          ticketId: ticket.id,
          authorName: 'Escalation Router',
          note: `🚨 ESCALATED TO ${dto.department.toUpperCase()}: ${dto.reason || 'Immediate attention required.'}`,
        },
      }),
      this.prisma.ticketActivityLog.create({
        data: {
          ticketId: ticket.id,
          operator,
          action: `Ticket escalated to ${dto.department}`,
        },
      }),
    ]);

    return updatedTicket;
  }
}
