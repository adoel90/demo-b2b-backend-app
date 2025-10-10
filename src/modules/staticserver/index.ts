// import express from "express"
// import path from "path"
// import type { MedusaContainer } from "@medusajs/framework/types"

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

import express from "express"
import path from "path"
import { Module } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

type ModuleOptions = {
  staticPath?: string
}

export const STATIC_MODULE = "staticserver";

class StaticServerService {
  constructor(container: MedusaContainer, options: ModuleOptions = {}) {
    const app = container.resolve("medusa_app")
    const staticPath = path.resolve(options.staticPath || "./static")

    // Pasang middleware untuk serve file statis
    //@ts-ignore
    app.use("/static", express.static(staticPath))

    console.log(`📁 Static server aktif di: /static → ${staticPath}`)
  }
}

export default Module("static-server", {
  service: StaticServerService,
})

