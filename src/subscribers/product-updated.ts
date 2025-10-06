import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

export default async function productUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  // send request to next.js storefront to revalidate cache

  console.log("Product updated event received with data:", data)
  await fetch(`${process.env.STORE_CORS}/api/revalidate?tags=products`)
}

export const config: SubscriberConfig = {
  event: "product.updated",
}