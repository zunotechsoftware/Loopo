import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from '../services/support.service';
import {
  FilterTicketsDto,
  ReplyTicketDto,
  AddNoteDto,
  UpdateTicketStatusDto,
  UpdateTicketPriorityDto,
  AssignAgentDto,
  EscalateTicketDto
} from '../dto/support.dto';

@ApiTags('Admin Support Tickets')
@Controller('admin/support/tickets')
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter all support tickets' })
  @ApiResponse({ status: 200, description: 'Tickets listed successfully.' })
  async listTickets(@Query() query: FilterTicketsDto) {
    const result = await this.supportService.listTickets(query);
    return {
      message: 'Support tickets retrieved successfully',
      data: result.tickets,
      total: result.total
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregate counts and statistics for support tickets' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully.' })
  async getTicketStats() {
    const stats = await this.supportService.getTicketStats();
    return {
      message: 'Support ticket statistics retrieved successfully',
      data: stats
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details and conversation history for a support ticket' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully.' })
  async getTicket(@Param('id') id: string) {
    const ticket = await this.supportService.getTicketById(id);
    return {
      message: 'Support ticket retrieved successfully',
      data: ticket
    };
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Send an agent reply with optional attachments' })
  @ApiResponse({ status: 201, description: 'Reply sent successfully.' })
  async sendReply(@Param('id') id: string, @Body() dto: ReplyTicketDto, @Request() req: any) {
    const senderName = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const senderId = req.user?.id;
    const message = await this.supportService.sendReply(id, dto, senderName, senderId);
    return {
      message: 'Reply sent successfully',
      data: message
    };
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a private internal note to a support ticket' })
  @ApiResponse({ status: 201, description: 'Internal note saved successfully.' })
  async addNote(@Param('id') id: string, @Body() dto: AddNoteDto, @Request() req: any) {
    const authorName = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const authorId = req.user?.id;
    const note = await this.supportService.addInternalNote(id, dto, authorName, authorId);
    return {
      message: 'Internal note saved successfully',
      data: note
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status of a support ticket' })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const ticket = await this.supportService.updateStatus(id, dto, operator);
    return {
      message: 'Ticket status updated successfully',
      data: ticket
    };
  }

  @Patch(':id/priority')
  @ApiOperation({ summary: 'Update priority level of a support ticket' })
  @ApiResponse({ status: 200, description: 'Priority updated successfully.' })
  async updatePriority(@Param('id') id: string, @Body() dto: UpdateTicketPriorityDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const ticket = await this.supportService.updatePriority(id, dto, operator);
    return {
      message: 'Ticket priority updated successfully',
      data: ticket
    };
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign a support ticket to an agent' })
  @ApiResponse({ status: 200, description: 'Agent assigned successfully.' })
  async assignAgent(@Param('id') id: string, @Body() dto: AssignAgentDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const ticket = await this.supportService.assignAgent(id, dto, operator);
    return {
      message: 'Ticket assigned successfully',
      data: ticket
    };
  }

  @Post(':id/escalate')
  @ApiOperation({ summary: 'Escalate a support ticket to a department' })
  @ApiResponse({ status: 200, description: 'Ticket escalated successfully.' })
  async escalateTicket(@Param('id') id: string, @Body() dto: EscalateTicketDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const ticket = await this.supportService.escalateTicket(id, dto, operator);
    return {
      message: 'Ticket escalated successfully',
      data: ticket
    };
  }
}
