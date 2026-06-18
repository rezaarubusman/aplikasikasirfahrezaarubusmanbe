import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";
import { ApiError } from "../../utils/api-error.js";

type ResourceType = "image" | "raw";

export class CloudinaryService {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
    this.apiKey = process.env.CLOUDINARY_API_KEY!;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET!;
  }

  //Generate Cloudinary signature (SHA1)
  private generateSignature(params: Record<string, string | number>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    return crypto
      .createHash("sha1")
      .update(sortedParams + this.apiSecret)
      .digest("hex");
  }

  //Upload image (jpg/png) — Digunakan untuk gambar produk
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    publicId?: string,
  ): Promise<{ url: string; publicId: string }> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);

      const params: Record<string, string | number> = {
        folder,
        timestamp,
      };

      if (publicId) {
        params.public_id = publicId;
      }

      const signature = this.generateSignature(params);

      const formData = new FormData();
      formData.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append("api_key", this.apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      if (publicId) {
        formData.append("public_id", publicId);
      }

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formData,
        { headers: formData.getHeaders() },
      );

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
      };
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error?.message || "Cloudinary image upload failed",
        error.response?.status || 500
      );
    }
  }

  //Mengekstrak public_id dari secure_url untuk keperluan penghapusan data
  extractPublicIdFromUrl(url: string): string {
    const withoutQuery = url.split("?")[0];
    const parts = withoutQuery.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    const publicIdParts = parts.slice(uploadIndex + 2);
    return publicIdParts.join("/");
  }

  //Menghapus file berdasarkan URL
  async deleteByUrl(url: string, resourceType: ResourceType = "image"): Promise<any> {
    const publicId = this.extractPublicIdFromUrl(url);
    return this.deleteByPublicId(publicId, resourceType);
  }

  //Menghapus file berdasarkan public_id
  async deleteByPublicId(
    publicId: string,
    resourceType: ResourceType = "image",
  ): Promise<any> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);

      const signature = this.generateSignature({
        public_id: publicId,
        timestamp,
      });

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("api_key", this.apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/destroy`,
        formData,
        { headers: formData.getHeaders() },
      );

      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error?.message || "Cloudinary file deletion failed",
        error.response?.status || 500
      );
    }
  }
}
