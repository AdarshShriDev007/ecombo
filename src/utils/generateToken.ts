import crypto from "crypto";

export const generateToken = () => {
     try {
        return crypto.randomBytes(30).toString("hex");
     } catch (error) {
        console.error("Failed to generate token",error);
        throw error;
     }
}