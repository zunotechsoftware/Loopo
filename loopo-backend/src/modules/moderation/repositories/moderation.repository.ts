import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma, UserStatus, ProductStatus } from '@prisma/client';

@Injectable()
export class ModerationRepository {
  constructor(public readonly prisma: PrismaService) {}

  async createAction(data: Prisma.ModerationActionUncheckedCreateInput) {
    return this.prisma.moderationAction.create({ data });
  }

  async createNote(data: Prisma.ModerationNoteUncheckedCreateInput) {
    return this.prisma.moderationNote.create({ data });
  }

  async createAssignment(data: Prisma.CaseAssignmentUncheckedCreateInput) {
    return this.prisma.caseAssignment.create({ data });
  }

  async createBlockedContent(data: Prisma.BlockedContentUncheckedCreateInput) {
    return this.prisma.blockedContent.create({ data });
  }

  async findBlockedContent(type: string, targetId: string) {
    return this.prisma.blockedContent.findUnique({
      where: { targetId },
    });
  }

  async deleteBlockedContent(targetId: string) {
    return this.prisma.blockedContent.delete({
      where: { targetId },
    });
  }

  async createWarning(data: Prisma.WarningHistoryUncheckedCreateInput) {
    return this.prisma.warningHistory.create({ data });
  }

  async findWarningHistory(userId: string) {
    return this.prisma.warningHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { warnedBy: { select: { email: true } } },
    });
  }

  async createUserStrike(data: Prisma.UserStrikeUncheckedCreateInput) {
    return this.prisma.userStrike.create({ data });
  }

  async getUserStrikesCount(userId: string): Promise<number> {
    const aggregate = await this.prisma.userStrike.aggregate({
      where: { userId },
      _sum: {
        strikeCount: true,
      },
    });
    return aggregate._sum.strikeCount || 0;
  }

  async clearUserStrikes(userId: string) {
    return this.prisma.userStrike.deleteMany({
      where: { userId },
    });
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async updateListingStatus(listingId: string, status: ProductStatus) {
    return this.prisma.product.update({
      where: { id: listingId },
      data: { status },
    });
  }

  async updateChatMessageStatus(messageId: string, content: string) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        status: 'DELETED', // Map to deleted state
      },
    });
  }

  async getModerationDashboardStats() {
    const openReports = await this.prisma.report.count({
      where: { status: 'OPEN', deletedAt: null },
    });

    const underReview = await this.prisma.report.count({
      where: { status: 'UNDER_REVIEW', deletedAt: null },
    });

    const resolved = await this.prisma.report.count({
      where: { status: 'RESOLVED', deletedAt: null },
    });

    const activeCases = await this.prisma.moderationCase.count({
      where: { status: { in: ['OPEN', 'ASSIGNED', 'UNDER_REVIEW'] }, deletedAt: null },
    });

    return {
      openReports,
      underReview,
      resolved,
      activeCases,
    };
  }
}
