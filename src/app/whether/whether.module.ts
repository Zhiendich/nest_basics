import { Module } from '@nestjs/common';

import { WhetherController } from './whether.controller';
import { ExternalApiModule } from 'src/modules/external-api.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ExternalApiModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const baseUrl = 'http://api.weatherapi.com/v1';
        const apiKey = configService.get<string>('WEATHER_API_KEY');

        return {
          baseURL: baseUrl,
          params: {
            key: apiKey,
          },
          timeout: 5000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [ConfigService],
  controllers: [WhetherController],
})
export class WhetherModule {}
