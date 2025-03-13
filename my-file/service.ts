import { AbstractFileProviderService } from "@medusajs/framework/utils";
import { ProviderUploadFileDTO, ProviderFileResultDTO, ProviderDeleteFileDTO } from "@medusajs/framework/types";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier"; // Required to stream file buffers to Cloudinary

class MyFileProviderService extends AbstractFileProviderService {
  static identifier = "cloudinary-files";

  constructor(container, options) {
    super();

    // Configure Cloudinary with environment variables (SECURE)
    cloudinary.config({
        cloud_name: "dn3wuzras",
        api_key: "656182613245861",
        api_secret: "gSdY9NkjaBPAdFbmJ5EvJHwHCrc"
    });
  }

  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    console.log(file,"ProviderUploadFileDTO");
    
    if (!file.content) {
        throw new Error("File content is missing. Ensure file is uploaded correctly.");
      }
  

    try {
      console.log("Uploading file to Cloudinary...");

      const fileBuffer = Buffer.from(file.content, "binary"); // or "base64" if needed

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "medusa_uploads", resource_type: "image" }, // Adjust if needed
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
      console.log("Upload successful:", uploadResult);

      return {
        url: uploadResult.secure_url,
        key: uploadResult.public_id,
      };
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw error;
    }
  }

  async delete(file: ProviderDeleteFileDTO): Promise<void> {
    console.log("Deleting file:", file);

    try {
      await cloudinary.uploader.destroy(file.fileKey);
      console.log(`Deleted file: ${file.fileKey}`);
    } catch (error) {
      console.error("Cloudinary Delete Error:", error);
      throw error;
    }
  }
}

export default MyFileProviderService;
