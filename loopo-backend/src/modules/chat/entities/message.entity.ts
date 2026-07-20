import { ApiProperty } from '@nestjs/swagger';
import { Message, MessageType, MessageStatus } from '@prisma/client';

export class MessageEntity implements Message {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5cc-810237e19005' })
  id: string;

  @ApiProperty({ example: 'd3b07384-d113-4956-a5cc-810237e19001' })
  conversationId: string;

  @ApiProperty({ example: 'd3b07384-d113-4956-a5cc-810237e19003' })
  senderId: string;

  @ApiProperty({ enum: MessageType, example: MessageType.TEXT })
  type: MessageType;

  @ApiProperty({ example: 'Hello, is this product still available?' })
  content: string;

  @ApiProperty({ enum: MessageStatus, example: MessageStatus.SENT })
  status: MessageStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ nullable: true })
  createdBy: string | null;

  @ApiProperty({ nullable: true })
  updatedBy: string | null;
}
