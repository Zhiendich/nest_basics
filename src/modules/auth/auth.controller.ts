import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';
import { LocalAuthGuard } from 'src/guards/auth.guard';
import { RegisterUserDto } from './dto/register.dto';
import { Response } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { JwtPayload } from 'src/types/jwt.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Public()
  async login(@Body() dto: LoginUserDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(dto);
    if (!user) {
      throw new NotFoundException();
    }

    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.json({ user, accessToken });
  }
  @Post('register')
  @Public()
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
  @Post('refresh')
  async refresh(@Request() req: { user: JwtPayload }, @Res() res: Response) {
    const { id, email } = req.user;
    const { accessToken, refreshToken } = await this.authService.refresh(
      id,
      email,
    );

    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(200).json({ accessToken });
  }
  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
    });
    return res.status(200).json({ message: 'Successfully logged out' });
  }
}
