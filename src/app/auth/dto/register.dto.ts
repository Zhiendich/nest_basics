import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'test@gmail.com',
    required: true,
  })
  email!: string;
  @IsString()
  @ApiProperty({
    example: '12345sdasad',
    required: true,
  })
  password!: string;
  @IsString()
  @ApiProperty({
    example: 'Ivan',
    required: true,
  })
  name!: string;
}
