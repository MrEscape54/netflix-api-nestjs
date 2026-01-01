import type { Request } from 'express';

export type JwtPayload = { sub: string; email: string; role: string };
export type JwtRequest = Request & { user: JwtPayload };
