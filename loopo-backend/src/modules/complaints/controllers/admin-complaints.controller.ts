import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ComplaintsService } from '../services/complaints.service';
import { JwtAuthGuard } from '../../../shared/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/common/guards/roles.guard';
import { PermissionsGuard } from '../../../shared/common/guards/permissions.guard';
import { Permissions } from '../../../shared/common/decorators/permissions.decorator';
import {
  FilterComplaintsDto,
  CreateComplaintDto,
  AddComplaintMessageDto,
  AddInvestigationNoteDto,
  UpdateComplaintStatusDto,
  AssignComplaintDto,
  ResolveComplaintDto,
  EscalateComplaintDto
} from '../dto/complaints.dto';

@ApiTags('Admin Complaints')
@ApiBearerAuth()
@Controller('admin/complaints')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Permissions('complaints.view')
  @Get()
  @ApiOperation({ summary: 'List and filter all complaints' })
  @ApiResponse({ status: 200, description: 'Complaints listed successfully.' })
  async listComplaints(@Query() query: FilterComplaintsDto) {
    const result = await this.complaintsService.listComplaints(query);
    return {
      message: 'Complaints retrieved successfully',
      data: result.complaints,
      total: result.total,
    };
  }

  @Permissions('complaints.view')
  @Get('stats')
  @ApiOperation({ summary: 'Get KPI statistics for complaints overview' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully.' })
  async getComplaintStats() {
    const stats = await this.complaintsService.getComplaintStats();
    return {
      message: 'Complaint statistics retrieved successfully',
      data: stats,
    };
  }

  @Permissions('complaints.view')
  @Get('categories-breakdown')
  @ApiOperation({ summary: 'Get category distribution for complaints' })
  @ApiResponse({ status: 200, description: 'Category distribution retrieved successfully.' })
  async getCategoriesBreakdown() {
    const breakdown = await this.complaintsService.getCategoriesBreakdown();
    return {
      message: 'Category distribution retrieved successfully',
      data: breakdown,
    };
  }

  @Permissions('complaints.view')
  @Get(':id')
  @ApiOperation({ summary: 'Get complaint details, investigation, and communication history' })
  @ApiResponse({ status: 200, description: 'Complaint retrieved successfully.' })
  async getComplaint(@Param('id') id: string) {
    const complaint = await this.complaintsService.getComplaintById(id);
    return {
      message: 'Complaint details retrieved successfully',
      data: complaint,
    };
  }

  @Permissions('complaints.manage')
  @Post()
  @ApiOperation({ summary: 'Create a new formal complaint' })
  @ApiResponse({ status: 201, description: 'Complaint created successfully.' })
  async createComplaint(@Body() dto: CreateComplaintDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const complaint = await this.complaintsService.createComplaint(dto, operator);
    return {
      message: 'Complaint created successfully',
      data: complaint,
    };
  }

  @Permissions('complaints.manage')
  @Post(':id/messages')
  @ApiOperation({ summary: 'Add a message to customer or vendor thread' })
  @ApiResponse({ status: 201, description: 'Message added successfully.' })
  async addMessage(@Param('id') id: string, @Body() dto: AddComplaintMessageDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const senderId = req.user?.id;
    const message = await this.complaintsService.addMessage(id, dto, operator, senderId);
    return {
      message: 'Message added successfully',
      data: message,
    };
  }

  @Permissions('complaints.manage')
  @Post(':id/notes')
  @ApiOperation({ summary: 'Add an investigation finding or admin remark' })
  @ApiResponse({ status: 201, description: 'Investigation note saved successfully.' })
  async addNote(@Param('id') id: string, @Body() dto: AddInvestigationNoteDto, @Request() req: any) {
    const authorName = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const authorId = req.user?.id;
    const note = await this.complaintsService.addInvestigationNote(id, dto, authorName, authorId);
    return {
      message: 'Investigation note saved successfully',
      data: note,
    };
  }

  @Permissions('complaints.resolve')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition complaint status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateComplaintStatusDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const complaint = await this.complaintsService.updateStatus(id, dto, operator);
    return {
      message: 'Complaint status updated successfully',
      data: complaint,
    };
  }

  @Permissions('complaints.assign')
  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign complaint to a department or agent' })
  @ApiResponse({ status: 200, description: 'Complaint assigned successfully.' })
  async assignComplaint(@Param('id') id: string, @Body() dto: AssignComplaintDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const complaint = await this.complaintsService.assignComplaint(id, dto, operator);
    return {
      message: 'Complaint assigned successfully',
      data: complaint,
    };
  }

  @Permissions('complaints.resolve')
  @Post(':id/resolve')
  @ApiOperation({ summary: 'Approve refund, credit, or resolution for complaint' })
  @ApiResponse({ status: 201, description: 'Resolution approved successfully.' })
  async resolveComplaint(@Param('id') id: string, @Body() dto: ResolveComplaintDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const result = await this.complaintsService.resolveComplaint(id, dto, operator);
    return {
      message: 'Complaint resolution approved successfully',
      data: result,
    };
  }

  @Permissions('complaints.resolve')
  @Post(':id/escalate')
  @ApiOperation({ summary: 'Escalate complaint to higher department' })
  @ApiResponse({ status: 200, description: 'Complaint escalated successfully.' })
  async escalateComplaint(@Param('id') id: string, @Body() dto: EscalateComplaintDto, @Request() req: any) {
    const operator = req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Admin User';
    const complaint = await this.complaintsService.escalateComplaint(id, dto, operator);
    return {
      message: 'Complaint escalated successfully',
      data: complaint,
    };
  }
}
