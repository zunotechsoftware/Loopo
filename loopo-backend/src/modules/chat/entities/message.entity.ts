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

  @ApiProperty({ description: 'The current status of the message' })
  status: MessageStatus;

  @ApiProperty({ description: 'Whether the message has been edited' })
  isEdited: boolean;

  @ApiProperty({ description: 'The ID of the message this is replying to (if any)', required: false })
  replyToId: string | null;

  @ApiProperty({ description: 'Date when message was created' })
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
