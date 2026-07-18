import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['info', 'warn', 'error'],
    });

    const extended = this.$extends({
      query: {
        user: {
          async delete({ args, query }) {
            return (extended as any).user.update({
              where: args.where,
              data: { deletedAt: new Date(), status: 'DELETED' },
            });
          },
          async deleteMany({ args, query }) {
            return (extended as any).user.updateMany({
              where: args.where,
              data: { deletedAt: new Date(), status: 'DELETED' },
            });
          },
          async findUnique({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findMany({ args, query }) {
            if (args.where) {
              if (args.where.deletedAt === undefined) {
                args.where = { ...args.where, deletedAt: null };
              }
            } else {
              args.where = { deletedAt: null };
            }
            return query(args);
          },
        },
      },
    });

    return extended as any;
  }

  async onModuleInit() {
    await (this as any).$connect();
  }

  async onModuleDestroy() {
    await (this as any).$disconnect();
  }
}
