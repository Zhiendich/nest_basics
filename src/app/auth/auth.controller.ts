import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
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
import { ApiResponse, ApiTags, OmitType } from '@nestjs/swagger';
import { Logger } from 'winston';
import { GetJwtPayload } from 'src/decorators/get-jwt-payload.decorator';
import { AuthDataTransfer } from 'src/types/auth.types';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // private readonly logger: Logger,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Public()
  async login(@Body() dto: LoginUserDto, @Res() res: Response) {
    // this.logger.error('CALLED');

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
  @ApiResponse({
    status: 201,
    type: OmitType(RegisterUserDto, ['password']),
  })
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
  @Post('refresh')
  async refresh(
    @Res() res: Response,
    @GetJwtPayload() jwtPayload: AuthDataTransfer,
  ) {
    const { accessToken, refreshToken, accessTokenInfo, refreshTokenInfo } =
      jwtPayload;
    const { id, email } = accessTokenInfo;
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(id, email);
    this.authService.addTokensToBlacklist(
      { accessToken, accessTokenExp: accessTokenInfo.exp },
      { refreshToken, refreshTokenExp: refreshTokenInfo.exp },
    );
    res.cookie('refreshToken', newRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(200).json({ accessToken: newAccessToken });
  }
  @Get('logout')
  async logout(
    @Res() res: Response,
    @GetJwtPayload() jwtPayload: AuthDataTransfer,
  ) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
    });
    const { accessToken, accessTokenInfo, refreshToken, refreshTokenInfo } =
      jwtPayload;
    this.authService.addTokensToBlacklist(
      { accessToken, accessTokenExp: accessTokenInfo.exp },
      { refreshToken, refreshTokenExp: refreshTokenInfo.exp },
    );

    return res.status(200).json({ message: 'Successfully logged out' });
  }
}
