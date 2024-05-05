import { NextFunction, Request, Response } from "express";
import { ControllerType } from "../types/types.js";

export const AsyncHandler =
  (ConType: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(ConType(req, res, next)).catch(next);
  };
