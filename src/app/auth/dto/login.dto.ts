import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'test@gmail.com',
    required: true,
  })
  email!: string;
  @IsString()
  @ApiProperty({
    example: '12345asdas',
    required: true,
  })
  password!: string;
}
