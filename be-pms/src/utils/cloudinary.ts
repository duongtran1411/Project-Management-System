import { v2 as cloudinary, UploadApiOptions } from "cloudinary";

class CloudDinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });
  }

  uploadImage(filePath: string, options?: UploadApiOptions) {
    return cloudinary.uploader.upload(filePath, options);
  }

  uploadVideo(filePath: string, options?: UploadApiOptions) {
    return cloudinary.uploader.upload(filePath, {
      ...options,
      resource_type: "video",
    });
  }

  getImageUrl(publicId: string, options?: any) {
    return cloudinary.url(publicId, options);
  }
}

export default new CloudDinaryService();
