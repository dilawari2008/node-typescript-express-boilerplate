import { HttpStatusCodes } from "@/common/constants";
import { IContextBrand, IContextUser } from "@/common/context";
import Config from "@/config";
import { NextFunction, Request, Response } from 'express';
import createError from "http-errors";
import { JwtPayload, sign, verify } from 'jsonwebtoken';


const DEFAULT_TIME = '1d';

interface IJwtPayload {
  user?: IContextUser;
  brand?: IContextBrand;
}

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req?.headers?.authorization?.split(' ')[1] || '';

    if (token) {
      const decodedToken = verify(token, Config.jwtSecret);

      const { user = {}, brand = {} } = decodedToken as unknown as JwtPayload;

      req.context.user = user;
      req.context.brand = brand;
      req.context.authToken = token;

      return next();
    }

    return next(createError(HttpStatusCodes.BAD_REQUEST, 'Token not found'));
  } catch (error) {
    return next(createError(HttpStatusCodes.UNAUTHORIZED, 'Auth failed!'));
  }
};

export const signJwt = (payload: IJwtPayload, expiresIn?: string): string => {
  const token = sign(JSON.parse(JSON.stringify(payload)), Config.jwtSecret, { expiresIn: expiresIn || DEFAULT_TIME });

  return token;
};
