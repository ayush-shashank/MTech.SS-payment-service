import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { IResponseError } from 'src/interface/response-error.interface';
import { TypeORMError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    let message = (exception as any).message;
    let code = 'RpcException';

    Logger.error(message, (exception as any).stack, 'GlobalExceptionFilter');

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof RpcException) {
      message = (exception as RpcException).getError();
    } else if (exception instanceof TypeORMError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = (exception as TypeORMError).message;
      code = (exception as any).code;
    }

    return throwError(() => this.GlobalResponseError(status, message, code));
  }

  GlobalResponseError: (
    statusCode: number,
    message: string,
    code: string,
  ) => IResponseError = (
    statusCode: number,
    message: string,
    code: string,
  ): IResponseError => {
    return {
      statusCode,
      message,
      code,
      timestamp: new Date().toISOString(),
    };
  };
}
