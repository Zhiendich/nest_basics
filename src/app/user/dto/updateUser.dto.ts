import { ApiProperty } from '@nestjs/swagger';
import { Roles } from '@prisma/client';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @ApiProperty({
    example: 'test@gmail.com',
    required: true,
  })
  email!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '12345sdasad',
    required: true,
  })
  password!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Ivan',
    required: true,
  })
  name!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'USER',
  })
  roles: Roles[];
}
