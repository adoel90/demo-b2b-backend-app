import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys} from "@medusajs/framework/utils";



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
      resolve: "@medusajs/medusa/cache-inmemory",
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
    
  },

    plugins: [
    {
      resolve: "@medusajs/draft-order",
      options: {},
    },
  ],
});
