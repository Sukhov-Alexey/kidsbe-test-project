/*
 *   Extend by necessary.
 *   Do Not Forget updated index
 */

export class HttpError extends Error {
  constructor(code: number, message: string, error?: any) {
    super(message);

    this.code = code;
    this.error = error;
  }
  code: number;
  error: any;

  format(): string {
    return `[${this.code}] ${this.message}: \n${this.error}`;
  }
}

export class BadRequestError extends HttpError {
  constructor(error?: any) {
    super(400, 'Bad Request', error);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(error?: any) {
    super(401, 'Unauthorized', error);
  }
}

export class ForbiddenError extends HttpError {
  constructor(error?: any) {
    super(403, 'Forbidden', error);
  }
}

export class NotFoundError extends HttpError {
  constructor(error?: any) {
    super(404, 'Not Found', error);
  }
}

export class InternalServerError extends HttpError {
  constructor(error?: any) {
    super(500, 'Internal Server Error', error);
  }
}
