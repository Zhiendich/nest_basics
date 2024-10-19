import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetFileDto {
  @IsString()
  @ApiProperty({
    example: 'file.txt',
    required: true,
  })
  fileName!: string;
}
