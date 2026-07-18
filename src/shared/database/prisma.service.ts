import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.registerSoftDeleteMiddleware();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private registerSoftDeleteMiddleware() {
    (this as any).$use(async (params: any, next: any) => {
      // Check if this model supports soft deletes
      const softDeleteModels = ['User'];
      if (softDeleteModels.includes(params.model || '')) {
        // Soft delete actions mapping
        if (params.action === 'delete') {
          params.action = 'update';
          params.args['data'] = {
            ...params.args['data'],
            deletedAt: new Date(),
            status: 'DELETED',
          };
        }
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          if (params.args['data'] !== undefined) {
            params.args['data']['deletedAt'] = new Date();
            params.args['data']['status'] = 'DELETED';
          } else {
            params.args['data'] = {
              deletedAt: new Date(),
              status: 'DELETED',
            };
          }
        }

        // Query filtering actions mapping (only fetch non-deleted)
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.action = 'findFirst';
          params.args.where = { ...params.args.where, deletedAt: null };
        }
        if (params.action === 'findMany') {
          if (params.args.where) {
            if (params.args.where.deletedAt === undefined) {
              params.args.where.deletedAt = null;
            }
          } else {
            params.args.where = { deletedAt: null };
          }
        }
      }
      return next(params);
    });
  }
}
