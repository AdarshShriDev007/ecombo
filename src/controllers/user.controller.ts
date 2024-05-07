import { NextFunction, Request, Response } from "express";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { RegisterBodyRequest } from "../types/types.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/user.model.js";
import { sendVerification } from "../utils/sendMail.js";
import { generateToken } from "../utils/generateToken.js";
import { ObjectId } from "mongoose";

// options
const options = {
    httpOnly: true,
    secure: true
}

// keys
const accessTokenKey = "accessToken";
const refreshTokenKey = "refreshToken";

// send email verification token
const sendEmailVerificationToken = async (
  userId: string,
  next: NextFunction
) => {
  try {
    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("User not found !", 404));

    const token = generateToken();
    if (!token)
      return next(
        new ErrorHandler("Token generation failed, Please try again.", 400)
      );
    user.emailVerificationToken = token;
    user.save({ validateBeforeSave: false });

    const link = `${process.env.FRONTEND_URL}/${user._id}/verify/${token}`;
    const verification = await sendVerification(
      user.email,
      "Verify your email address",
      link
    );
    return verification;
  } catch (error) {
    console.error(error);
  }
};

// generate access & refresh (jwt) token
const generateAccessAndRefreshToken = async (
  userId: string,
  next: NextFunction
) => {
  try {
    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("User not found !", 404));

    const access_token = await user.generateAccessToken();
    const refresh_token = await user.generateRefreshToken();

    if (!access_token || !refresh_token)
      return next(
        new ErrorHandler(
          "Refresh and Access token generated failed, please try again.",
          401
        )
      );

    return {
      access_token,
      refresh_token,
    };
  } catch (error) {
    return next(
      new ErrorHandler(
        "Something went wrong while generating refresh & access token",
        500
      )
    );
  }
};

// register now
export const register = AsyncHandler(
  async (
    req: Request<{}, {}, RegisterBodyRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const { firstname, lastname, email, gender, dob, password } = req.body;
    if (!firstname || !lastname || !email || !gender || !dob || !password)
      // check empty fields
      return next(new ErrorHandler("All fields all required", 400));
    // check user exist
    const emailExist = await User.findOne({ email });
    if (emailExist) return next(new ErrorHandler("Email Already Exist", 409));

    // create user
    const user = await User.create({
      firstname,
      lastname,
      email,
      gender,
      dob,
      password,
    });

    if (!user)
      return next(
        new ErrorHandler("Registration failed, Please try again.", 400)
      );

    // send email for verification
    const verify = await sendEmailVerificationToken(String(user._id), next);
    if (verify) {
      return res.status(201).json({
        success: true,
        message:
          "Registeration successfully, Please verify your email address.",
      });
    } else {
      return next(
        new ErrorHandler("Email sending failed, Please try again.", 400)
      );
    }
  }
);

// email verification
export const verifyEmail = AsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const token = req.params.token;

  // check user id & token
  const user = await User.findOne({ _id: id, emailVerificationToken: token });
  if (!user) return next(new ErrorHandler("Invalid link", 400));

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

export const login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("All fields are required", 400));
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("Invalid user creadentials", 401));

  const isValidPassword = await user.isCurrectPassword(password);
  if (!isValidPassword)
    return next(new ErrorHandler("Invalid email and password", 401));

  if (!user.isVerified) {
    // send email for verification
    const verify = await sendEmailVerificationToken(String(user._id), next);
    if (verify) {
      return res.status(200).json({
        success: true,
        message: "Please verify your email address.",
      });
    } else {
      return next(
        new ErrorHandler("Email sending failed, Please try again.", 400)
      );
    }
  }

  const tokens = await generateAccessAndRefreshToken(String(user._id), next);
  if (!tokens)
    return next(
      new ErrorHandler("Tokens generated failed, Please try again.", 500)
    );

  const { access_token, refresh_token } = tokens;

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -resetPasswordToken"
  );

  return res.status(200)
  .cookie(accessTokenKey,access_token,options)
  .cookie(refreshTokenKey,refresh_token,options)
  .json({
    success: true,
    message: `Welcome, ${loggedInUser?.firstname}`,
    user: {
        access_token,
        refresh_token,
        loggedInUser
    }
  })

});
