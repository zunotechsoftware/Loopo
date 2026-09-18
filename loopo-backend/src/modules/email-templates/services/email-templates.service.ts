import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from '../dto/email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: any) {
    // Add pagination and filtering if needed
    return this.prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`EmailTemplate with ID ${id} not found`);
    }
    return template;
  }

  async create(data: CreateEmailTemplateDto) {
    return this.prisma.emailTemplate.create({
      data,
    });
  }

  async update(id: string, data: UpdateEmailTemplateDto) {
    // Check if exists
    await this.findOne(id);
    return this.prisma.emailTemplate.update({
      where: { id },
      data,
    });
  }

  async getStats() {
    const total = await this.prisma.emailTemplate.count();
    const active = await this.prisma.emailTemplate.count({
      where: { status: 'ACTIVE' },
    });
    const usedAgg = await this.prisma.emailTemplate.aggregate({ _sum: { used: true } });

    // openRate/clickRate stay unavailable rather than fabricated: there is
    // no table tracking individual email sends/opens/clicks yet, only a
    // per-template `used` counter (unlike notifications, which at least
    // has a real per-row status).
    return {
      total,
      active,
      activePercentage: total > 0 ? ((active / total) * 100).toFixed(2) + '%' : '0%',
      usedThisMonth: usedAgg._sum.used || 0,
      openRate: null,
      clickRate: null,
    };
  }
}
