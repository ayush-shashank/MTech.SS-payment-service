import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { TcpContext } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class EventInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const rpcContext = context.switchToRpc();
    const tcpContext = rpcContext.getContext<TcpContext>();
    const data = rpcContext.getData();
    Logger.log(data, `'${tcpContext.getPattern()}'`);
    return next.handle();
  }
}
