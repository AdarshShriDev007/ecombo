import { NextFunction, Request, Response } from "express";

export type ControllerType = (
    req:Request,
    res:Response,
    next:NextFunction
) => Promise<void | Response<any, Record<string, any>>>

export interface RegisterBodyRequest {
    firstname: string;
    lastname: string;
    email: string;
    gender: string;
    dob: Date;
    password: string;
}