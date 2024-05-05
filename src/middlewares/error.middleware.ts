import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler.js";

export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;

  if (err.name === "CastError") message = "Invalid ID";

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};
