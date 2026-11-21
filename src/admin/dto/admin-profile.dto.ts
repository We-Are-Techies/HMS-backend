import { ApiProperty } from '@nestjs/swagger';

export class AdminProfileDto {
  @ApiProperty({ example: '673ee85fa9123b456c789012' })
  id: string;

  @ApiProperty({ example: 'Varma Admin' })
  name: string;

  @ApiProperty({ example: 'admin@varmanursinghome.com' })
  email: string;

  @ApiProperty({ example: 'admin' })
  role: string;

  @ApiProperty({ example: '2026-11-21T14:00:00.000Z' })
  createdAt: Date;
}

