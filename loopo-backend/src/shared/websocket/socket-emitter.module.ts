import { Global, Module } from '@nestjs/common';
import { SocketEmitterService } from './socket-emitter.service';

/** @Global so any feature module can inject SocketEmitterService without
 * adding it to its own `imports` - keeps this a true leaf dependency. */
@Global()
@Module({
  providers: [SocketEmitterService],
  exports: [SocketEmitterService],
})
export class SocketEmitterModule {}
