import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalApiService {
  constructor(private readonly httpService: HttpService) {}

  async fetch(endpoint: string, params?: Record<string, string>) {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get(`${endpoint}`, {
            params: {
              ...params,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error(
                `Error during request: ${endpoint}`,
                error.response?.data,
              );
              throw new BadRequestException();
            }),
          ),
      );

      return data;
    } catch (error) {
      console.log('ERROR', error);
      throw new BadRequestException();
    }
  }
}
