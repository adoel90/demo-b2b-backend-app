"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const quote_1 = require("./src/modules/quote");
const approval_1 = require("./src/modules/approval");
const company_1 = require("./src/modules/company");
const utils_1 = require("@medusajs/framework/utils");
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
(0, utils_1.loadEnv)(process.env.NODE_ENV, process.cwd());
module.exports = (0, utils_1.defineConfig)({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        redisUrl: process.env.REDIS_URL,
        http: {
            storeCors: process.env.STORE_CORS,
            adminCors: process.env.ADMIN_CORS,
            authCors: process.env.AUTH_CORS,
            jwtSecret: process.env.JWT_SECRET || "supersecret",
            cookieSecret: process.env.COOKIE_SECRET || "supersecret",
        },
        workerMode: process.env.MEDUSA_WORKER_MODE,
    },
    admin: {
        disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
        backendUrl: process.env.MEDUSA_BACKEND_URL,
    },
    modules: {
        // auth: {
        //   resolve: "@medusajs/medusa/auth",
        //   dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
        //   // options: {
        //   //   providers: [
        //   //     {
        //   //       resolve: "@medusajs/auth",
        //   //       id: "emailpass",
        //   //       options: {
        //   //         // Opsi hashing seperti logN, r, p bisa ditambahkan
        //   //       },
        //   //     },
        //   //     // provider lain jika perlu...
        //   //   ],
        //   // },
        // },
        [company_1.COMPANY_MODULE]: {
            resolve: "./modules/company",
        },
        [quote_1.QUOTE_MODULE]: {
            resolve: "./modules/quote",
        },
        [approval_1.APPROVAL_MODULE]: {
            resolve: "./modules/approval",
        },
        [utils_1.Modules.CACHE]: {
            // resolve: "@medusajs/medusa/cache-inmemory",          
            resolve: "@medusajs/medusa/cache-redis",
            options: {
                redisUrl: process.env.REDIS_URL,
            },
        },
        [utils_1.Modules.WORKFLOW_ENGINE]: {
            resolve: "@medusajs/medusa/workflow-engine-inmemory",
        },
        [utils_1.Modules.EVENT_BUS]: {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: {
                redisUrl: process.env.REDIS_URL,
            },
        },
        // [Modules.FILE]: {
        //   resolve: "@medusajs/medusa/file",      
        //   options: {
        //      providers: [
        //       {
        //         resolve: "./src/modules/cloudinary-file",
        //         id: "cloudinary",
        //         options: {
        //           cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        //           api_key: process.env.CLOUDINARY_API_KEY,
        //           api_secret: process.env.CLOUDINARY_API_SECRET,
        //           secure: true,
        //           folder: "medusa-uploads"
        //         },
        //       }, 
        //     ],
        //   }
        // }
        [utils_1.Modules.FILE]: {
            resolve: "@medusajs/medusa/file",
            options: {
                providers: [
                    {
                        // resolve: "@jaykanjia/medusa-file-cloudinary/providers/file-cloudinary",
                        // id: "cloudinary",
                        // options: {
                        //   apiKey: process.env.CLOUDINARY_API_KEY,
                        //   apiSecret: process.env.CLOUDINARY_API_SECRET,
                        //   cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                        //   folderName: "medusa", // optional, defaults to root
                        //   secure: true,         // optional, defaults to true
                        // },
                        resolve: "@medusajs/medusa/file-local",
                        id: "local",
                        options: {
                            uploadDir: "static", // folder tempat file disimpan
                            baseUrl: "http://localhost:9000", // base URL untuk akses file
                        },
                    },
                ],
            }
        },
        // [STATIC_MODULE]: {
        //   resolve: "./modules/staticserver",  // ⬅️ Path ke module custom
        // },
    },
    plugins: [
        {
            resolve: "@medusajs/draft-order",
            options: {},
        },
        // {
        //   resolve: `@jaykanjia/medusa-file-cloudinary`,
        //   options: {
        //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        //     api_key: process.env.CLOUDINARY_API_KEY,
        //     api_secret: process.env.CLOUDINARY_API_SECRET,
        //     secure: false,
        //   },
        // },
    ],
});
async function default_1({ app }) {
    const staticPath = path_1.default.resolve("./static");
    app.use("/static", express_1.default.static(staticPath));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUE0SUEsNEJBR0M7QUEvSUQsK0NBQW1EO0FBQ25ELHFEQUF5RDtBQUN6RCxtREFBdUQ7QUFFdkQscURBQXFHO0FBRXJHLGdEQUF1QjtBQUN2QixzREFBNkI7QUFFN0IsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFFOUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFBLG9CQUFZLEVBQUM7SUFDNUIsYUFBYSxFQUFFO1FBQ2IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWTtRQUNyQyxRQUFRLEVBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTO1FBQ2hDLElBQUksRUFBRTtZQUNKLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7WUFDbEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVztZQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFVO1lBQ2hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxhQUFhO1lBQ2xELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhO1NBQ3pEO1FBQ0QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW9EO0tBQzdFO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEtBQUssTUFBTTtRQUNwRCxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0I7S0FDM0M7SUFDSCxPQUFPLEVBQUU7UUFDUCxVQUFVO1FBQ1Ysc0NBQXNDO1FBQ3RDLHFFQUFxRTtRQUNyRSxrQkFB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