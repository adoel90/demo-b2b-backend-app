import { AbstractFileProviderService } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { 
  FileTypes 
} from "@medusajs/framework/types"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { MedusaError } from "@medusajs/framework/utils"
import { Readable } from "stream"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  cloud_name?: string
  api_key?: string
  api_secret?: string
  secure?: boolean
  folder?: string
}

class CloudinaryFileProviderService extends AbstractFileProviderService {
  static identifier = "cloudinary"
  protected logger_: Logger
  protected options_: Options

  constructor(
    { logger }: InjectedDependencies,
    options: Options
  ) {
    super()

    this.logger_ = logger
    this.options_ = options

    // Configure Cloudinary with options or environment variables
    cloudinary.config({
      cloud_name: options.cloud_name || process.env.CLOUDINARY_CLOUD_NAME,
      api_key: options.api_key || process.env.CLOUDINARY_API_KEY,
      api_secret: options.api_secret || process.env.CLOUDINARY_API_SECRET,
      secure: options.secure ?? true
    })

    this.logger_.info("Cloudinary file provider initialized")
  }

  static validateOptions(options: Record<any, any>) {
    // Check if credentials are provided either in options or environment
    const cloudName = options.cloud_name || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = options.api_key || process.env.CLOUDINARY_API_KEY
    const apiSecret = options.api_secret || process.env.CLOUDINARY_API_SECRET

    if (!cloudName) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "cloud_name is required in the provider's options or CLOUDINARY_CLOUD_NAME environment variable."
      )
    }
    if (!apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "api_key is required in the provider's options or CLOUDINARY_API_KEY environment variable."
      )
    }
    if (!apiSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "api_secret is required in the provider's options or CLOUDINARY_API_SECRET environment variable."
      )
    }
  }

  async upload(
    file: FileTypes.ProviderUploadFileDTO
  ): Promise<FileTypes.ProviderFileResultDTO> {
    try {
      const folder = this.options_.folder || "medusa-uploads"
      
      const result: UploadApiResponse = await cloudinary.uploader.upload(file.filename, {
        resource_type: "auto",
        public_id: `${Date.now()}-${file.filename.split('/').pop()?.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        folder: folder,
        use_filename: true,
        unique_filename: true
      })

      this.logger_.info(`File uploaded to Cloudinary: ${result.secure_url}`)

      return {
        url: result.secure_url,
        key: result.public_id
      }
    } catch (error) {
      this.logger_.error(`Failed to upload file to Cloudinary: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to upload file: ${error.message}`
      )
    }
  }

  async delete(
    files: FileTypes.ProviderDeleteFileDTO | FileTypes.ProviderDeleteFileDTO[]
  ): Promise<void> {
    const fileArray = Array.isArray(files) ? files : [files]
    
    for (const file of fileArray) {
      try {
        // Use fileKey if available, otherwise extract from URL
        const publicId = file.fileKey || this.extractPublicIdFromUrl(file.fileKey || '')
        
        if (!publicId) {
          throw new Error("Cannot determine public_id for file deletion")
        }

        const result = await cloudinary.uploader.destroy(publicId)
        
        if (result.result === 'ok') {
          this.logger_.info(`File deleted from Cloudinary: ${publicId}`)
        } else if (result.result === 'not found') {
          this.logger_.warn(`File not found in Cloudinary: ${publicId}`)
        } else {
          this.logger_.warn(`File deletion result: ${result.result} for ${publicId}`)
        }
      } catch (error) {
        this.logger_.error(`Failed to delete file from Cloudinary: ${error.message}`)
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Failed to delete file: ${error.message}`
        )
      }
    }
  }

  async getPresignedDownloadUrl(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<string> {
    try {
      // For Cloudinary, we can generate a signed URL for private resources
      // or return the public URL directly for public resources
      const publicId = fileData.fileKey
      
      if (!publicId) {
        throw new Error("File key is required")
      }

      // Generate a signed URL with expiration
      const signedUrl = cloudinary.url(publicId, {
        secure: true,
        sign_url: true,
        type: "authenticated",
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
      })

      return signedUrl
    } catch (error) {
      this.logger_.error(`Failed to generate presigned URL: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate presigned URL: ${error.message}`
      )
    }
  }

  async getPresignedUploadUrl(
    fileData: FileTypes.ProviderGetPresignedUploadUrlDTO
  ): Promise<FileTypes.ProviderFileResultDTO> {
    try {
      const folder = this.options_.folder || "medusa-uploads"
      const publicId = `${Date.now()}-${fileData.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      // Generate upload signature
      const timestamp = Math.round(new Date().getTime() / 1000)
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp: timestamp,
          public_id: publicId,
          folder: folder
        },
        cloudinary.config().api_secret!
      )

      // Construct upload URL
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/auto/upload`

      return {
        url: uploadUrl,
        key: publicId,
        // Additional fields that might be needed for the upload
        fields: {
          api_key: cloudinary.config().api_key,
          timestamp: timestamp.toString(),
          signature: signature,
          public_id: publicId,
          folder: folder
        }
      } as FileTypes.ProviderFileResultDTO
    } catch (error) {
      this.logger_.error(`Failed to generate presigned upload URL: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate presigned upload URL: ${error.message}`
      )
    }
  }

  async getAsBuffer(
    file: FileTypes.ProviderGetFileDTO
  ): Promise<Buffer> {
    try {
      const publicId = file.fileKey
      
      if (!publicId) {
        throw new Error("File key is required")
      }

      // Get the file URL and fetch it as buffer
      const fileUrl = cloudinary.url(publicId, { secure: true })
      const response = await fetch(fileUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      this.logger_.error(`Failed to get file as buffer: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to get file as buffer: ${error.message}`
      )
    }
  }

  async getAsStream(
    file: FileTypes.ProviderGetFileDTO
  ): Promise<Readable> {
    try {
      const publicId = file.fileKey
      
      if (!publicId) {
        throw new Error("File key is required")
      }

      // Get the file URL and create a readable stream
      const fileUrl = cloudinary.url(publicId, { secure: true })
      const response = await fetch(fileUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      // Convert ReadableStream to Node.js Readable stream
      return Readable.from(response.body as any)
    } catch (error) {
      this.logger_.error(`Failed to get file as stream: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to get file as stream: ${error.message}`
      )
    }
  }

  private extractPublicIdFromUrl(url: string): string {
    try {
      // Extract public_id from Cloudinary URL
      // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
      const urlParts = url.split('/')
      const uploadIndex = urlParts.findIndex(part => part === 'upload')
      
      if (uploadIndex === -1) {
        return ''
      }

      // Get everything after version (v1234567890)
      const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/')
      // Remove file extension
      return pathAfterVersion.replace(/\.[^/.]+$/, '')
    } catch (error) {
      this.logger_.error(`Failed to extract public_id from URL: ${error.message}`)
      return ''
    }
  }
}

export default CloudinaryFileProviderService