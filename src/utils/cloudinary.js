import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; 
import dotenv from "dotenv";
dotenv.config();


// configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
}); 

const uploadOnCloudinary = async (localFilePath) => {
    // console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_KEY);
    
    try {
        if(!localFilePath) return null 
        // upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { 
            resource_type: "image",
        });
        // console.log("upload response: ", response);
        
        // console.log("File has been uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) 
        console.log("error uploading to cloudinary", error);
        
        return null 
    }
}

export { uploadOnCloudinary }