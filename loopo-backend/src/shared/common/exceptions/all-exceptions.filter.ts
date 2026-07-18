import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      const resContent: any = exception.getResponse();
      if (typeof resContent === 'string') {
        message = resContent;
      } else if (resContent && typeof resContent === 'object') {
        if (Array.isArray(resContent.message)) {
          errors = resContent.message;
          message = 'Validation failed';
        } else {
          message = resContent.message || exception.message;
          if (resContent.error) {
            errors = [resContent.error];
          }
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`Unknown Exception: ${JSON.stringify(exception)}`);
    }

    response.status(status).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : [message],
    });
  }
}
