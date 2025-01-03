import { v2 as cloudinary } from "cloudinary";
const uploadBase64 = async (base64String, folder) => {
  try {
    console.log(base64String);
    if (!base64String.startsWith("data:image/")) {
      throw new Error(
        'Invalid Base64 format. Ensure it starts with "data:image/".'
      );
    }

    const result = await cloudinary.uploader.upload(base64String, {
      folder,
    });

    console.log("Upload successful:", result);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading Base64 to Cloudinary:", error.message);
    throw error;
  }
};
export default uploadBase64;
