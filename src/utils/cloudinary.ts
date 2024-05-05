import {v2 as cloudinary, UploadApiResponse} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (filePath:string): Promise<UploadApiResponse> => {
   try {
    if(!filePath) throw new Error("File path is empty");

    // upload file to cloudinary
    const response = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto"
    });

    // remove the locally saved temporary file
    fs.unlinkSync(filePath);

    return response;

   } catch (error) {
    fs.unlinkSync(filePath);
    console.log("Error uploading file ",error);
    throw new Error("Failed to upload file to cloudinary");
   }
}