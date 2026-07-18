import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already matching the format, return it as is
        if (data && typeof data === 'object' && 'success' in data && 'message' in data && 'data' in data) {
          return data;
        }

        let message = 'Operation successful';
        let responseData = data;

        if (data && typeof data === 'object') {
          if ('message' in data && 'data' in data) {
            message = (data as any).message;
            responseData = (data as any).data;
          } else if ('message' in data) {
            message = (data as any).message;
            responseData = { ...data };
            delete (responseData as any).message;
          }
        }

        return {
          success: true,
          message,
          data: responseData || {},
        };
      }),
    );
  }
}
