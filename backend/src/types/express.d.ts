import type { IUser } from '../models/User.js';

// Augment Express's Request so authenticated handlers can read `userId`/`user`
// set by the auth middleware without casting to `any`.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: IUser;
    }
  }
}

export {};
