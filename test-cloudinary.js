import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

cloudinary.config({ secure: true });

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
