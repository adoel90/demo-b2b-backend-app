"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quote_1 = require("./src/modules/quote");
const approval_1 = require("./src/modules/approval");
const company_1 = require("./src/modules/company");
const utils_1 = require("@medusajs/framework/utils");
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
            resolve: "@medusajs/medusa/cache-inmemory",
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
    },
    plugins: [
        {
            resolve: "@medusajs/draft-order",
            options: {},
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQ0FBbUQ7QUFDbkQscURBQXlEO0FBQ3pELG1EQUF1RDtBQUN2RCxxREFBcUc7QUFJckcsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFFOUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFBLG9CQUFZLEVBQUM7SUFDNUIsYUFBYSxFQUFFO1FBQ2IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWTtRQUNyQyxRQUFRLEVBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTO1FBQ2hDLElBQUksRUFBRTtZQUNKLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7WUFDbEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVztZQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFVO1lBQ2hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxhQUFhO1lBQ2xELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhO1NBQ3pEO1FBQ0QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW9EO0tBQzdFO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEtBQUssTUFBTTtRQUNwRCxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0I7S0FDM0M7SUFDSCxPQUFPLEVBQUU7UUFDUCxVQUFVO1FBQ1Ysc0NBQXNDO1FBQ3RDLHFFQUFxRTtRQUNyRSxrQkFBa0I7UUFDbEIsc0JBQXNCO1FBQ3RCLGFBQWE7UUFDYix3Q0FBd0M7UUFDeEMsOEJBQThCO1FBQzlCLHdCQUF3QjtRQUN4QixtRUFBbUU7UUFDbkUsZ0JBQWdCO1FBQ2hCLGNBQWM7UUFDZCwwQ0FBMEM7UUFDMUMsWUFBWTtRQUNaLFVBQVU7UUFDVixLQUFLO1FBQ0wsQ0FBQyx3QkFBYyxDQUFDLEVBQUU7WUFDaEIsT0FBTyxFQUFFLG1CQUFtQjtTQUM3QjtRQUNELENBQUMsb0JBQVksQ0FBQyxFQUFFO1lBQ2QsT0FBTyxFQUFFLGlCQUFpQjtTQUMzQjtRQUNELENBQUMsMEJBQWUsQ0FBQyxFQUFFO1lBQ2pCLE9BQU8sRUFBRSxvQkFBb0I7U0FDOUI7UUFDRCxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNmLE9BQU8sRUFBRSxpQ0FBaUM7U0FDM0M7UUFDRCxDQUFDLGVBQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUN6QixPQUFPLEVBQUUsMkNBQTJDO1NBQ3JEO1FBQ0QsQ0FBQyxlQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxFQUFFLGtDQUFrQztZQUMzQyxPQUFPLEVBQUU7Z0JBQ1AsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUzthQUNoQztTQUNGO0tBRUY7SUFFQyxPQUFPLEVBQUU7UUFDVDtZQUNFLE9BQU8sRUFBRSx1QkFBdUI7WUFDaEMsT0FBTyxFQUFFLEVBQUU7U0FDWjtLQUNGO0NBQ0YsQ0FBQyxDQUFDIn0=