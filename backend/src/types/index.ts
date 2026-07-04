import type { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}
