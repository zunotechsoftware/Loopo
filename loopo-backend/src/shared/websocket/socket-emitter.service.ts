import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

/**
 * A tiny, dependency-free handle to the app's one real-time Server
 * instance (owned by ChatGateway). Any module that needs to push a
 * real-time event to a user can depend on this instead of ChatModule
 * directly - ChatModule already imports ProductsModule, so a module like
 * notifications (which ProductsService needs, to notify admins when a
 * listing is submitted) importing ChatModule back would be circular.
 * ChatGateway registers itself here once on init; everything else only
 * ever reads it.
 */
@Injectable()
export class SocketEmitterService {
  private readonly logger = new Logger(SocketEmitterService.name);
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  /** Every authenticated socket connection already joins `user:${userId}`
   * on connect (see ChatGateway.handleConnection) - this reuses that same
   * room rather than tracking connections separately. */
  emitToUser(userId: string, event: string, payload: unknown) {
    if (!this.server) {
      this.logger.warn(`Socket server not ready yet - dropped "${event}" for user ${userId}`);
      return;
    }
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
