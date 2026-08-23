import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailTemplatesService } from '../services/email-templates.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from '../dto/email-template.dto';

@ApiTags('Admin / Email Templates')
@Controller('admin/email-templates')
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get email template statistics' })
  getStats() {
    return this.emailTemplatesService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all email templates' })
  findAll(@Query() params: any) {
    return this.emailTemplatesService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email template by id' })
  findOne(@Param('id') id: string) {
    return this.emailTemplatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new email template' })
  create(@Body() data: CreateEmailTemplateDto) {
    return this.emailTemplatesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update email template' })
  update(@Param('id') id: string, @Body() data: UpdateEmailTemplateDto) {
    return this.emailTemplatesService.update(id, data);
  }
}
