import { HttpModule, HttpModuleOptions } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';
import { ExternalApiService } from 'src/services/external-api.service';

@Module({})
export class ExternalApiModule {
  static register(apiConfig: {
    baseUrl: string;
    apiKey: string;
  }): DynamicModule {
    return {
      module: ExternalApiModule,
      imports: [
        HttpModule.register({
          baseURL: apiConfig.baseUrl,
          headers: {
            Authorization: `Bearer ${apiConfig.apiKey}`,
          },
          timeout: 5000,
        }),
      ],
      providers: [ExternalApiService],
      exports: [ExternalApiService],
    };
  }
  static registerAsync(apiConfigFactory: {
    useFactory: (
      ...args: any[]
    ) => Promise<HttpModuleOptions> | HttpModuleOptions;
    inject: any[];
  }): DynamicModule {
    return {
      module: ExternalApiModule,
      imports: [
        HttpModule.registerAsync({
          useFactory: apiConfigFactory.useFactory,
          inject: apiConfigFactory.inject,
        }),
      ],
      providers: [ExternalApiService],
      exports: [ExternalApiService],
    };
  }
}
