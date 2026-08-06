import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const urlMatch = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
if (urlMatch) {
  cloudinary.config({
    api_key: urlMatch[1],
    api_secret: urlMatch[2],
    cloud_name: urlMatch[3],
    secure: true,
  });
} else {
  console.log("No match");
}
async function testUpload() {
  console.log("Starting Cloudinary test...");
  try {
    // 1x1 transparent PNG
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    
    console.log("Attempting upload...");
    const result = await cloudinary.uploader.upload(base64Image, { folder: "test" });
    
    console.log("Upload Success!");
    console.log(result.secure_url);
    
    // Clean up
    await cloudinary.uploader.destroy(result.public_id);
    console.log("Cleanup Success!");
  } catch (error) {
    console.error("Upload Failed:");
    console.error(error);
  }
}

testUpload();
