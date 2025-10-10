import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { STATIC_MODULE } from "./src/modules/staticserver";
import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys} from "@medusajs/framework/utils";

import path from "path"
import express from "express"

loadEnv(process.env.NODE_ENV!, process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl : process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",
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
    [COMPANY_MODULE]: {
      resolve: "./modules/company",
    },
    [QUOTE_MODULE]: {
      resolve: "./modules/quote",
    },
    [APPROVAL_MODULE]: {
      resolve: "./modules/approval",
    },
    [Modules.CACHE]: {
          
            // resolve: "@medusajs/medusa/cache-inmemory",          
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },

       
    },
    
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/workflow-engine-inmemory",
    },
    [Modules.EVENT_BUS]: {
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
    [Modules.FILE]: {
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


export default async function ({ app }) {
  const staticPath = path.resolve("./static")
  app.use("/static", express.static(staticPath))
}