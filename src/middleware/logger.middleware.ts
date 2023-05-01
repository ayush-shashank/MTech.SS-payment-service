import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    Logger.log(req.path, req.method);
    res.on('finish', () => {
      if (res.statusCode === 200 || res.statusCode === 201)
        Logger.log(res.statusMessage, res.statusCode.toString());
      else if (res.statusCode === 204 || res.statusCode === 304)
        Logger.warn(res.statusMessage, res.statusCode.toString());
      else Logger.error(res.statusMessage, res.statusCode.toString());
    });
    next();
  }
}
