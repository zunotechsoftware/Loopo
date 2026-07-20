import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPlanById(id: string) {
    return this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { features: true },
    });
  }

  async findPlanByName(name: string) {
    return this.prisma.subscriptionPlan.findUnique({
      where: { name },
      include: { features: true },
    });
  }

  async findAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      include: { features: true },
    });
  }

  async createSubscription(data: Prisma.SubscriptionUncheckedCreateInput) {
    return this.prisma.subscription.create({ data });
  }

  async updateSubscription(id: string, data: Prisma.SubscriptionUpdateInput) {
    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }

  async findSubscriptionById(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });
  }

  async findSubscriptionByProviderId(providerSubscriptionId: string) {
    return this.prisma.subscription.findUnique({
      where: { providerSubscriptionId },
      include: { plan: true },
    });
  }

  async findActiveUserSubscription(userId: string) {
    return this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true, subscription: true },
    });
  }

  async createUserSubscription(data: Prisma.UserSubscriptionUncheckedCreateInput) {
    return this.prisma.userSubscription.create({ data });
  }

  async updateUserSubscription(userId: string, data: Prisma.UserSubscriptionUncheckedUpdateInput) {
    return this.prisma.userSubscription.update({
      where: { userId },
      data,
    });
  }

  async deleteUserSubscription(userId: string) {
    return this.prisma.userSubscription.delete({
      where: { userId },
    });
  }
}
