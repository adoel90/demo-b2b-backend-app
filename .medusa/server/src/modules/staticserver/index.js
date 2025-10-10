"use strict";
// import express from "express"
// import path from "path"
// import type { MedusaContainer } from "@medusajs/framework/types"
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATIC_MODULE = void 0;
// type ModuleOptions = {
//   staticPath?: string
// }
// export default async function (container: MedusaContainer, options: ModuleOptions = {}) {
//   const app = container.resolve("medusa_app")
//   const staticPath = path.resolve(options.staticPath || "./static")
//   //@ts-ignore
//   app.use("/static", express.static(staticPath))
//   console.log(`📁 Static server aktif di: /static → ${staticPath}`)
// }
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("@medusajs/framework/utils");
exports.STATIC_MODULE = "staticserver";
class StaticServerService {
    constructor(container, options = {}) {
        const app = container.resolve("medusa_app");
        const staticPath = path_1.default.resolve(options.staticPath || "./static");
        // Pasang middleware untuk serve file statis
        //@ts-ignore
        app.use("/static", express_1.default.static(staticPath));
        console.log(`📁 Static server aktif di: /static → ${staticPath}`);
    }
}
exports.default = (0, utils_1.Module)("static-server", {
    service: StaticServerService,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9zdGF0aWNzZXJ2ZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGdDQUFnQztBQUNoQywwQkFBMEI7QUFDMUIsbUVBQW1FOzs7Ozs7QUFFbkUseUJBQXlCO0FBQ3pCLHdCQUF3QjtBQUN4QixJQUFJO0FBR0osNEZBQTRGO0FBQzVGLGdEQUFnRDtBQUNoRCxzRUFBc0U7QUFFdEUsaUJBQWlCO0FBQ2pCLG1EQUFtRDtBQUVuRCxzRUFBc0U7QUFDdEUsSUFBSTtBQUVKLHNEQUE2QjtBQUM3QixnREFBdUI7QUFDdkIscURBQWtEO0FBT3JDLFFBQUEsYUFBYSxHQUFHLGNBQWMsQ0FBQztBQUU1QyxNQUFNLG1CQUFtQjtJQUN2QixZQUFZLFNBQTBCLEVBQUUsVUFBeUIsRUFBRTtRQUNqRSxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQzNDLE1BQU0sVUFBVSxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsQ0FBQTtRQUVqRSw0Q0FBNEM7UUFDNUMsWUFBWTtRQUNaLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7UUFFOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsVUFBVSxFQUFFLENBQUMsQ0FBQTtJQUNuRSxDQUFDO0NBQ0Y7QUFFRCxrQkFBZSxJQUFBLGNBQU0sRUFBQyxlQUFlLEVBQUU7SUFDckMsT0FBTyxFQUFFLG1CQUFtQjtDQUM3QixDQUFDLENBQUEifQ==