import { v2 as cloudinary } from "cloudinary";
const uploadBase64 = async (file, folder) => {
  try {
    console.log(file, folder);
    if (!file) throw new Error("No file found");
    const resourceType =
      folder == "audios" ? "raw" : folder == "videos" ? "video" : "image";
    console.log(resourceType);
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: resourceType,
    });

    console.log("Upload successful:", result);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading Base64 to Cloudinary:", error);
    throw error;
  }
};
export default uploadBase64;
