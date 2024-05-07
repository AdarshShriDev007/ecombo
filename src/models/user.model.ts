import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface Iuser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  gender: "male" | "female" | "other";
  dob: Date;
  password: string;
  role: "admin" | "user";
  refreshToken?: string | undefined;
  isVerified: boolean;
  emailVerificationToken?: string | undefined;
  resetPasswordToken?: string | undefined;
  resetPasswordTokenExpiry?: Date | undefined;
  isCurrectPassword(password:string):Promise<boolean>;
  generateAccessToken():Promise<string>;
  generateRefreshToken():Promise<string>;
  createdAt: Date;
  updatedAt: Date;
  age: number;
}

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    refreshToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

// age calculation
userSchema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob;
  let age = today.getFullYear() - dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
});


// hash password
userSchema.pre("save",async function(next){
    const user = this;
    if(!user.isModified("password")) return next();

    try {
        const saltRound = await bcrypt.genSalt(10);
        const hassedPassword = await bcrypt.hash(user.password, saltRound);
        user.password = hassedPassword;
    } catch (error) {
        return next(error as Error);
    }
})

// check password
userSchema.methods.isCurrectPassword = async function(this: Iuser, password:string):Promise<boolean>{
    return await bcrypt.compare(password, this.password);
}

// generate access token
userSchema.methods.generateAccessToken = async function(){
    try {
        return jwt.sign({
            userId: this._id.toString(),
            email: this.email,
            role: this.role
        }, process.env.ACCESS_TOKEN_SECRET!, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY!
        })
    } catch (error) {
        console.error(error);
    }
}

// generate refresh token
userSchema.methods.generateRefreshToken = async function(){
    try {
        return jwt.sign({
            userId: this._id.toString(),
        }, process.env.REFRESH_TOKEN_SECRET!, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY!
        })
    } catch (error) {
        console.error(error);
    }
}

export const User = mongoose.model<Iuser>("User", userSchema);
