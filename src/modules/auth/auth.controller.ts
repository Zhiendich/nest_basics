import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';
import { LocalAuthGuard } from 'src/guards/auth.guard';
import { RegisterUserDto } from './dto/register.dto';
import { Request, Response } from 'express';
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
  async refresh(
    @Req()
    req: Request & {
      accessTokenInfo: JwtPayload;
      refreshTokenInfo: JwtPayload;
    },
    @Res() res: Response,
    @Headers('Authorization') authorizationHeader,
  ) {
    const { id, email } = req.accessTokenInfo;
    const accessToken = authorizationHeader.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(id, email);
    this.authService.addTokensToBlacklist(
      { accessToken, accessTokenExp: req.accessTokenInfo.exp },
      { refreshToken, refreshTokenExp: req.refreshTokenInfo.exp },
    );
    res.cookie('refreshToken', newRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(200).json({ accessToken: newAccessToken });
  }
  @Get('logout')
  async logout(
    @Req()
    req: Request & {
      accessTokenInfo: JwtPayload;
      refreshTokenInfo: JwtPayload;
    },
    @Res() res: Response,
    @Headers('Authorization') authorizationHeader,
  ) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
    });
    const accessToken = authorizationHeader.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    this.authService.addTokensToBlacklist(
      { accessToken, accessTokenExp: req.accessTokenInfo.exp },
      { refreshToken, refreshTokenExp: req.refreshTokenInfo.exp },
    );

    return res.status(200).json({ message: 'Successfully logged out' });
  }
}
