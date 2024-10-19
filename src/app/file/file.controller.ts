import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetFileDto } from './dto/getFile.dto';
import { join } from 'path';
import { Response } from 'express';
import { createReadStream, promises as fs } from 'fs';

@UseInterceptors(FileInterceptor('file'))
@Controller('file')
export class FileController {
  @Post('upload')
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 140000 }),
          new FileTypeValidator({
            fileType:
              /^(image\/jpeg|image\/jpg|image\/png|image\/gif|text\/plain)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return { message: 'Success downloaded file' };
  }
  @Post('getFile')
  async getFile(@Body() body: GetFileDto, @Res() res: Response) {
    const filePath = join(__dirname, '../../../upload', body.fileName);
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}
