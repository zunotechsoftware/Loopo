import { ApiProperty } from '@nestjs/swagger';
import { Conversation, ConversationParticipant, Message, ConversationSetting } from '@prisma/client';

export class ConversationEntity implements Conversation {
  @ApiProperty({ example: 'd3b07384-d113-4956-a5cc-810237e19001' })
  id: string;

  @ApiProperty({ example: 'd3b07384-d113-4956-a5cc-810237e19002' })
  productId: string;

  @ApiProperty({ example: 'd3b07384-d113-4956-a5cc-810237e19003' })
  buyerId: string;

  @ApiProperty({ example: 'd3b07384-d113-4956-a5cc-810237e19004' })
  sellerId: string;

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

  // relations
  participants?: ConversationParticipant[];
  messages?: Message[];
  settings?: ConversationSetting[];
}
