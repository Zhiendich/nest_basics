import { JwtPayload } from './jwt.types';

export type AuthDataTransfer = {
  user: JwtPayload;
  refreshToken: string;
  accessToken: string;
  refreshTokenInfo: JwtPayload;
  accessTokenInfo: JwtPayload;
};
