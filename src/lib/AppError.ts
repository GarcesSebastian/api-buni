/**
 * Typed application error. The central error handler maps `statusCode` + `message` to the response
 * envelope `{ error: message }`, reproducing the exact Phase-0 snapshot statuses/messages.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public expose = true,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
