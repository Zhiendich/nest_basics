import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    const { type, data } = metadata;
    if (type === 'param' && data === 'id') {
      const id = parseInt(value, 10);
      if (isNaN(id)) {
        throw new BadRequestException('Invalid ID, must be a number');
      }
      return id;
    }

    return value;
  }
}
