import { IsString, IsEmail } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
  @IsString()
  name!: string;
}
