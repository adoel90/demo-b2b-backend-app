"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const cloudinary_1 = require("cloudinary");
const utils_2 = require("@medusajs/framework/utils");
const stream_1 = require("stream");
class CloudinaryFileProviderService extends utils_1.AbstractFileProviderService {
    constructor({ logger }, options) {
        super();
        this.logger_ = logger;
        this.options_ = options;
        // Configure Cloudinary with options or environment variables
        cloudinary_1.v2.config({
            cloud_name: options.cloud_name || process.env.CLOUDINARY_CLOUD_NAME,
            api_key: options.api_key || process.env.CLOUDINARY_API_KEY,
            api_secret: options.api_secret || process.env.CLOUDINARY_API_SECRET,
            secure: options.secure ?? true
        });
        this.logger_.info("Cloudinary file provider initialized");
    }
    static validateOptions(options) {
        // Check if credentials are provided either in options or environment
        const cloudName = options.cloud_name || process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = options.api_key || process.env.CLOUDINARY_API_KEY;
        const apiSecret = options.api_secret || process.env.CLOUDINARY_API_SECRET;
        if (!cloudName) {
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.INVALID_DATA, "cloud_name is required in the provider's options or CLOUDINARY_CLOUD_NAME environment variable.");
        }
        if (!apiKey) {
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.INVALID_DATA, "api_key is required in the provider's options or CLOUDINARY_API_KEY environment variable.");
        }
        if (!apiSecret) {
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.INVALID_DATA, "api_secret is required in the provider's options or CLOUDINARY_API_SECRET environment variable.");
        }
    }
    async upload(file) {
        try {
            const folder = this.options_.folder || "medusa-uploads";
            const result = await cloudinary_1.v2.uploader.upload(file.filename, {
                resource_type: "auto",
                public_id: `${Date.now()}-${file.filename.split('/').pop()?.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
                folder: folder,
                use_filename: true,
                unique_filename: true
            });
            this.logger_.info(`File uploaded to Cloudinary: ${result.secure_url}`);
            return {
                url: result.secure_url,
                key: result.public_id
            };
        }
        catch (error) {
            this.logger_.error(`Failed to upload file to Cloudinary: ${error.message}`);
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.UNEXPECTED_STATE, `Failed to upload file: ${error.message}`);
        }
    }
    async delete(files) {
        const fileArray = Array.isArray(files) ? files : [files];
        for (const file of fileArray) {
            try {
                // Use fileKey if available, otherwise extract from URL
                const publicId = file.fileKey || this.extractPublicIdFromUrl(file.fileKey || '');
                if (!publicId) {
                    throw new Error("Cannot determine public_id for file deletion");
                }
                const result = await cloudinary_1.v2.uploader.destroy(publicId);
                if (result.result === 'ok') {
                    this.logger_.info(`File deleted from Cloudinary: ${publicId}`);
                }
                else if (result.result === 'not found') {
                    this.logger_.warn(`File not found in Cloudinary: ${publicId}`);
                }
                else {
                    this.logger_.warn(`File deletion result: ${result.result} for ${publicId}`);
                }
            }
            catch (error) {
                this.logger_.error(`Failed to delete file from Cloudinary: ${error.message}`);
                throw new utils_2.MedusaError(utils_2.MedusaError.Types.UNEXPECTED_STATE, `Failed to delete file: ${error.message}`);
            }
        }
    }
    async getPresignedDownloadUrl(fileData) {
        try {
            // For Cloudinary, we can generate a signed URL for private resources
            // or return the public URL directly for public resources
            const publicId = fileData.fileKey;
            if (!publicId) {
                throw new Error("File key is required");
            }
            // Generate a signed URL with expiration
            const signedUrl = cloudinary_1.v2.url(publicId, {
                secure: true,
                sign_url: true,
                type: "authenticated",
                expires_at: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
            });
            return signedUrl;
        }
        catch (error) {
            this.logger_.error(`Failed to generate presigned URL: ${error.message}`);
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.UNEXPECTED_STATE, `Failed to generate presigned URL: ${error.message}`);
        }
    }
    async getPresignedUploadUrl(fileData) {
        try {
            const folder = this.options_.folder || "medusa-uploads";
            const publicId = `${Date.now()}-${fileData.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            // Generate upload signature
            const timestamp = Math.round(new Date().getTime() / 1000);
            const signature = cloudinary_1.v2.utils.api_sign_request({
                timestamp: timestamp,
                public_id: publicId,
                folder: folder
            }, cloudinary_1.v2.config().api_secret);
            // Construct upload URL
            const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinary_1.v2.config().cloud_name}/auto/upload`;
            return {
                url: uploadUrl,
                key: publicId,
                // Additional fields that might be needed for the upload
                fields: {
                    api_key: cloudinary_1.v2.config().api_key,
                    timestamp: timestamp.toString(),
                    signature: signature,
                    public_id: publicId,
                    folder: folder
                }
            };
        }
        catch (error) {
            this.logger_.error(`Failed to generate presigned upload URL: ${error.message}`);
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.UNEXPECTED_STATE, `Failed to generate presigned upload URL: ${error.message}`);
        }
    }
    async getAsBuffer(file) {
        try {
            const publicId = file.fileKey;
            if (!publicId) {
                throw new Error("File key is required");
            }
            // Get the file URL and fetch it as buffer
            const fileUrl = cloudinary_1.v2.url(publicId, { secure: true });
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }
        catch (error) {
            this.logger_.error(`Failed to get file as buffer: ${error.message}`);
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.UNEXPECTED_STATE, `Failed to get file as buffer: ${error.message}`);
        }
    }
    async getAsStream(file) {
        try {
            const publicId = file.fileKey;
            if (!publicId) {
                throw new Error("File key is required");
            }
            // Get the file URL and create a readable stream
            const fileUrl = cloudinary_1.v2.url(publicId, { secure: true });
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
            }
            if (!response.body) {
                throw new Error("Response body is null");
            }
            // Convert ReadableStream to Node.js Readable stream
            return stream_1.Readable.from(response.body);
        }
        catch (error) {
            this.logger_.error(`Failed to get file as stream: ${error.message}`);
            throw new utils_2.MedusaError(utils_2.MedusaError.Types.UNEXPECTED_STATE, `Failed to get file as stream: ${error.message}`);
        }
    }
    extractPublicIdFromUrl(url) {
        try {
            // Extract public_id from Cloudinary URL
            // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
            const urlParts = url.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            if (uploadIndex === -1) {
                return '';
            }
            // Get everything after version (v1234567890)
            const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
            // Remove file extension
            return pathAfterVersion.replace(/\.[^/.]+$/, '');
        }
        catch (error) {
            this.logger_.error(`Failed to extract public_id from URL: ${error.message}`);
            return '';
        }
    }
}
CloudinaryFileProviderService.identifier = "cloudinary";
exports.default = CloudinaryFileProviderService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL2Nsb3VkaW5hcnktZmlsZS9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQXVFO0FBS3ZFLDJDQUFnRTtBQUNoRSxxREFBdUQ7QUFDdkQsbUNBQWlDO0FBY2pDLE1BQU0sNkJBQThCLFNBQVEsbUNBQTJCO0lBS3JFLFlBQ0UsRUFBRSxNQUFNLEVBQXdCLEVBQ2hDLE9BQWdCO1FBRWhCLEtBQUssRUFBRSxDQUFBO1FBRVAsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUE7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7UUFFdkIsNkRBQTZEO1FBQzdELGVBQVUsQ0FBQyxNQUFNLENBQUM7WUFDaEIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUI7WUFDbkUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0I7WUFDMUQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUI7WUFDbkUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSTtTQUMvQixDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO0lBQzNELENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLE9BQXlCO1FBQzlDLHFFQUFxRTtRQUNyRSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUE7UUFDekUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFBO1FBQ2hFLE1B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