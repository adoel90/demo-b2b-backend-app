"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = productUpdatedHandler;
async function productUpdatedHandler({ event: { data }, container, }) {
    // send request to next.js storefront to revalidate cache
    console.log("Product updated event received with data:", data);
    await fetch(`${process.env.STORE_CORS}/api/revalidate?tags=products`);
}
exports.config = {
    event: "product.updated",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdC11cGRhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N1YnNjcmliZXJzL3Byb2R1Y3QtdXBkYXRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSx3Q0FRQztBQVJjLEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxFQUNsRCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFDZixTQUFTLEdBQ3NCO0lBQy9CLHlEQUF5RDtJQUV6RCxPQUFPLENBQUMsR0FBRyxDQUFDLDJDQUEyQyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzlELE1BQU0sS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLCtCQUErQixDQUFDLENBQUE7QUFDdkUsQ0FBQztBQUVZLFFBQUEsTUFBTSxHQUFxQjtJQUN0QyxLQUFLLEVBQUUsaUJBQWlCO0NBQ3pCLENBQUEifQ==