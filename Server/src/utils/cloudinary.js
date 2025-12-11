import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'


// import dotenv from 'dotenv'
// dotenv.config()

const CLOUDINARY_CLOUD_NAME = "dpbcws6eu"
const CLOUDINARY_API_KEY = "997285735788579"
const CLOUDINARY_API_SECRET = "isBJRtFsI-me4piPepXBi6iiI-0"

// Configure Cloudinary
const configureCloudinary = () => {
    const config = {
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true
    };


    cloudinary.config(config);
    return config;
};

// Initialize configuration
const cloudinaryConfig = configureCloudinary();


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No local file path provided");
            return null;
        }



        // Convert to absolute path to handle path issues
        const absolutePath = path.resolve(localFilePath);




        // Check if file exists before uploading
        if (!fs.existsSync(absolutePath)) {
            console.log("File does not exist at path:", absolutePath);
            return null;
        }

        //upload the file on cloudinary  
        const response = await cloudinary.uploader.upload(absolutePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("File uploaded successfully to cloudinary:", response.url);
        fs.unlinkSync(absolutePath)
        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        console.error("Error details:", {
            message: error.message,
            http_code: error.http_code,
            api_key: error.api_key
        });

        // Only delete file if it exists
        const pathToDelete = path.resolve(localFilePath);
        if (fs.existsSync(pathToDelete)) {
            fs.unlinkSync(pathToDelete);
        }
        return null;
    }
}



export { uploadOnCloudinary }