import { Controller, Get } from '@nestjs/common';
import { ExternalApiService } from 'src/services/external-api.service';

@Controller('whether')
export class WhetherController {
  constructor(private readonly whetherApi: ExternalApiService) {}
  @Get('')
  async getCurrentWhether() {
    try {
      const currentWhether = await this.whetherApi.fetch('/current.json', {
        q: 'London',
      });

      return currentWhether;
    } catch (error) {
      console.log('ERROR', error);
    }
  }
}
