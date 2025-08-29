"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedDemoData;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
async function seedDemoData({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const fulfillmentModuleService = container.resolve(utils_1.ModuleRegistrationName.FULFILLMENT);
    const salesChannelModuleService = container.resolve(utils_1.ModuleRegistrationName.SALES_CHANNEL);
    const storeModuleService = container.resolve(utils_1.ModuleRegistrationName.STORE);
    const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];
    logger.info("Seeding store data...");
    const [store] = await storeModuleService.listStores();
    let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });
    if (!defaultSalesChannel.length) {
        // create the default sales channel
        const { result: salesChannelResult } = await (0, core_flows_1.createSalesChannelsWorkflow)(container).run({
            input: {
                salesChannelsData: [
                    {
                        name: "Default Sales Channel",
                    },
                ],
            },
        });
        defaultSalesChannel = salesChannelResult;
    }
    await (0, core_flows_1.updateStoresWorkflow)(container).run({
        input: {
            selector: { id: store.id },
            update: {
                supported_currencies: [
                    {
                        currency_code: "eur",
                        is_default: true,
                    },
                    {
                        currency_code: "usd",
                    },
                ],
                default_sales_channel_id: defaultSalesChannel[0].id,
            },
        },
    });
    logger.info("Seeding region data...");
    const { result: regionResult } = await (0, core_flows_1.createRegionsWorkflow)(container).run({
        input: {
            regions: [
                {
                    name: "Europe",
                    currency_code: "eur",
                    countries,
                    payment_providers: ["pp_system_default"],
                },
            ],
        },
    });
    const region = regionResult[0];
    logger.info("Finished seeding regions.");
    logger.info("Seeding tax regions...");
    await (0, core_flows_1.createTaxRegionsWorkflow)(container).run({
        input: countries.map((country_code) => ({
            country_code,
        })),
    });
    logger.info("Finished seeding tax regions.");
    logger.info("Seeding stock location data...");
    const { result: stockLocationResult } = await (0, core_flows_1.createStockLocationsWorkflow)(container).run({
        input: {
            locations: [
                {
                    name: "European Warehouse",
                    address: {
                        city: "Copenhagen",
                        country_code: "DK",
                        address_1: "",
                    },
                },
            ],
        },
    });
    const stockLocation = stockLocationResult[0];
    await link.create({
        [utils_1.Modules.STOCK_LOCATION]: {
            stock_location_id: stockLocation.id,
        },
        [utils_1.Modules.FULFILLMENT]: {
            fulfillment_provider_id: "manual_manual",
        },
    });
    logger.info("Seeding fulfillment data...");
    const { result: shippingProfileResult } = await (0, core_flows_1.createShippingProfilesWorkflow)(container).run({
        input: {
            data: [
                {
                    name: "Default",
                    type: "default",
                },
            ],
        },
    });
    const shippingProfile = shippingProfileResult[0];
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
        name: "European Warehouse delivery",
        type: "shipping",
        service_zones: [
            {
                name: "Europe",
                geo_zones: [
                    {
                        country_code: "gb",
                        type: "country",
                    },
                    {
                        country_code: "de",
                        type: "country",
                    },
                    {
                        country_code: "dk",
                        type: "country",
                    },
                    {
                        country_code: "se",
                        type: "country",
                    },
                    {
                        country_code: "fr",
                        type: "country",
                    },
                    {
                        country_code: "es",
                        type: "country",
                    },
                    {
                        country_code: "it",
                        type: "country",
                    },
                ],
            },
        ],
    });
    await link.create({
        [utils_1.Modules.STOCK_LOCATION]: {
            stock_location_id: stockLocation.id,
        },
        [utils_1.Modules.FULFILLMENT]: {
            fulfillment_set_id: fulfillmentSet.id,
        },
    });
    await (0, core_flows_1.createShippingOptionsWorkflow)(container).run({
        input: [
            {
                name: "Standard Shipping",
                price_type: "flat",
                provider_id: "manual_manual",
                service_zone_id: fulfillmentSet.service_zones[0].id,
                shipping_profile_id: shippingProfile.id,
                type: {
                    label: "Standard",
                    description: "Ship in 2-3 days.",
                    code: "standard",
                },
                prices: [
                    {
                        currency_code: "usd",
                        amount: 10,
                    },
                    {
                        currency_code: "eur",
                        amount: 10,
                    },
                    {
                        region_id: region.id,
                        amount: 10,
                    },
                ],
                rules: [
                    {
                        attribute: "enabled_in_store",
                        value: '"true"',
                        operator: "eq",
                    },
                    {
                        attribute: "is_return",
                        value: "false",
                        operator: "eq",
                    },
                ],
            },
            {
                name: "Express Shipping",
                price_type: "flat",
                provider_id: "manual_manual",
                service_zone_id: fulfillmentSet.service_zones[0].id,
                shipping_profile_id: shippingProfile.id,
                type: {
                    label: "Express",
                    description: "Ship in 24 hours.",
                    code: "express",
                },
                prices: [
                    {
                        currency_code: "usd",
                        amount: 10,
                    },
                    {
                        currency_code: "eur",
                        amount: 10,
                    },
                    {
                        region_id: region.id,
                        amount: 10,
                    },
                ],
                rules: [
                    {
                        attribute: "enabled_in_store",
                        value: '"true"',
                        operator: "eq",
                    },
                    {
                        attribute: "is_return",
                        value: "false",
                        operator: "eq",
                    },
                ],
            },
        ],
    });
    logger.info("Finished seeding fulfillment data.");
    await (0, core_flows_1.linkSalesChannelsToStockLocationWorkflow)(container).run({
        input: {
            id: stockLocation.id,
            add: [defaultSalesChannel[0].id],
        },
    });
    logger.info("Finished seeding stock location data.");
    logger.info("Seeding publishable API key data...");
    const { result: publishableApiKeyResult } = await (0, core_flows_1.createApiKeysWorkflow)(container).run({
        input: {
            api_keys: [
                {
                    title: "Webshop",
                    type: "publishable",
                    created_by: "",
                },
            ],
        },
    });
    const publishableApiKey = publishableApiKeyResult[0];
    await (0, core_flows_1.linkSalesChannelsToApiKeyWorkflow)(container).run({
        input: {
            id: publishableApiKey.id,
            add: [defaultSalesChannel[0].id],
        },
    });
    logger.info("Finished seeding publishable API key data.");
    logger.info("Seeding product data...");
    const { result: [collection], } = await (0, core_flows_1.createCollectionsWorkflow)(container).run({
        input: {
            collections: [
                {
                    title: "Featured",
                    handle: "featured",
                },
            ],
        },
    });
    const { result: categoryResult } = await (0, core_flows_1.createProductCategoriesWorkflow)(container).run({
        input: {
            product_categories: [
                {
                    name: "Laptops",
                    is_active: true,
                },
                {
                    name: "Accessories",
                    is_active: true,
                },
                {
                    name: "Phones",
                    is_active: true,
                },
                {
                    name: "Monitors",
                    is_active: true,
                },
            ],
        },
    });
    await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: '16" Ultra-Slim AI Laptop | 3K OLED | 1.1cm Thin | 6-Speaker Audio',
                    collection_id: collection.id,
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Laptops")?.id,
                    ],
                    description: "This ultra-thin 16-inch laptop is a sophisticated, high-performance machine for the new era of artificial intelligence. It has been completely redesigned from the inside out. The cabinet features an exquisite new ceramic-aluminum composite material in a range of nature-inspired colors. This material provides durability while completing the ultra-slim design and resisting the test of time. This innovative computer utilizes the latest AI-enhanced processor with quiet ambient cooling. It's designed to enrich your lifestyle on the go with an astonishingly thin 1.1cm chassis that houses an advanced 16-inch 3K OLED display and immersive six-speaker audio.",
                    weight: 400,
                    status: utils_1.ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/laptop-front.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/laptop-side.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/laptop-top.png",
                        },
                    ],
                    options: [
                        {
                            title: "Storage",
                            values: ["256 GB", "512 GB"],
                        },
                        {
                            title: "Color",
                            values: ["Blue", "Red"],
                        },
                    ],
                    variants: [
                        {
                            title: "256 GB / Blue",
                            sku: "256-BLUE",
                            options: {
                                Storage: "256 GB",
                                Color: "Blue",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 1299,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 1299,
                                    currency_code: "usd",
                                },
                            ],
                        },
                        {
                            title: "512 GB / Red",
                            sku: "512-RED",
                            options: {
                                Storage: "512 GB",
                                Color: "Red",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 1259,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 1259,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });
    await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: "1080p HD Pro Webcam | Superior Video | Privacy enabled",
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Accessories")?.id,
                    ],
                    description: "High-quality 1080p HD webcam that elevates your work environment with superior video and audio that outperforms standard laptop cameras. Achieve top-tier video collaboration at a cost-effective price point, ideal for widespread deployment across your organization.",
                    weight: 400,
                    status: utils_1.ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/camera-front.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/camera-side.png",
                        },
                    ],
                    options: [
                        {
                            title: "Color",
                            values: ["Black", "White"],
                        },
                    ],
                    variants: [
                        {
                            title: "Webcam Black",
                            sku: "WEBCAM-BLACK",
                            options: {
                                Color: "Black",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 59,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 59,
                                    currency_code: "usd",
                                },
                            ],
                        },
                        {
                            title: "Webcam White",
                            sku: "WEBCAM-WHITE",
                            options: {
                                Color: "White",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 65,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 65,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });
    await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: `6.5" Ultra HD Smartphone | 3x Impact-Resistant Screen`,
                    collection_id: collection.id,
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Phones")?.id,
                    ],
                    description: 'This premium smartphone is crafted from durable and lightweight aerospace-grade aluminum, featuring an expansive 6.5" Ultra-High Definition AMOLED display. It boasts exceptional durability with a cutting-edge nanocrystal glass front, offering three times the impact resistance of standard smartphone screens. The device combines sleek design with robust protection, setting a new standard for smartphone resilience and visual excellence. Copy',
                    weight: 400,
                    status: utils_1.ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/phone-front.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/phone-side.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/phone-bottom.png",
                        },
                    ],
                    options: [
                        {
                            title: "Memory",
                            values: ["256 GB", "512 GB"],
                        },
                        {
                            title: "Color",
                            values: ["Purple", "Red"],
                        },
                    ],
                    variants: [
                        {
                            title: "256 GB Purple",
                            sku: "PHONE-256-PURPLE",
                            options: {
                                Memory: "256 GB",
                                Color: "Purple",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 999,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 999,
                                    currency_code: "usd",
                                },
                            ],
                        },
                        {
                            title: "256 GB Red",
                            sku: "PHONE-256-RED",
                            options: {
                                Memory: "256 GB",
                                Color: "Red",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 959,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 959,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });
    await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: `34" QD-OLED Curved Gaming Monitor | Ultra-Wide | Infinite Contrast | 175Hz`,
                    collection_id: collection.id,
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Monitors")?.id,
                    ],
                    description: "Experience the pinnacle of display technology with this 34-inch curved monitor. By merging OLED panels and Quantum Dot technology, this QD-OLED screen delivers exceptional contrast, deep blacks, unlimited viewing angles, and vivid colors. The curved design provides an immersive experience, allowing you to enjoy the best of both worlds in one cutting-edge display. This innovative monitor represents the ultimate fusion of visual performance and immersive design.",
                    weight: 400,
                    status: utils_1.ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/screen-front.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/screen-side.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/screen-top.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/screen-back.png",
                        },
                    ],
                    options: [
                        {
                            title: "Color",
                            values: ["White", "Black"],
                        },
                    ],
                    variants: [
                        {
                            title: "ACME Monitor 4k White",
                            sku: "ACME-MONITOR-WHITE",
                            options: {
                                Color: "White",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 599,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 599,
                                    currency_code: "usd",
                                },
                            ],
                        },
                        {
                            title: "ACME Monitor 4k White",
                            sku: "ACME-MONITOR-BLACK",
                            options: {
                                Color: "Black",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 599,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 599,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });
    await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: "Hi-Fi Gaming Headset | Pro-Grade DAC | Hi-Res Certified",
                    collection_id: collection.id,
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Accessories")?.id,
                    ],
                    description: `Experience studio-quality audio with this advanced acoustic system, which pairs premium hardware with high-fidelity sound and innovative audio software for an immersive listening experience. The integrated digital-to-analog converter (DAC) enhances the audio setup with high-resolution certification and a built-in amplifier, delivering exceptional sound clarity and depth. This comprehensive audio solution brings professional-grade sound to your personal environment, whether for gaming, music production, or general entertainment.`,
                    weight: 400,
                    status: utils_1.ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/headphone-front.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/headphone-side.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/headphone-top.png",
                        },
                    ],
                    options: [
                        {
                            title: "Color",
                            values: ["Black", "White"],
                        },
                    ],
                    variants: [
                        {
                            title: "Headphone Black",
                            sku: "HEADPHONE-BLACK",
                            options: {
                                Color: "Black",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 149,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 149,
                                    currency_code: "usd",
                                },
                            ],
                        },
                        {
                            title: "Headphone White",
                            sku: "HEADPHONE-WHITE",
                            options: {
                                Color: "White",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 149,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 149,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });
    await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: "Wireless Keyboard | Touch ID | Numeric Keypad",
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Accessories")?.id,
                    ],
                    description: `This wireless keyboard offers a comfortable typing experience with a numeric keypad and Touch ID. It features navigation buttons, full-sized arrow keys, and is ideal for spreadsheets and gaming. The rechargeable battery lasts about a month. It pairs automatically with compatible computers and includes a USB-C to Lightning cable for charging and pairing.`,
                    weight: 400,
                    status: utils_1.ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/keyboard-front.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/keyboard-side.png",
                        },
                    ],
                    options: [
                        {
                            title: "Color",
                            values: ["Black", "White"],
                        },
                    ],
                    variants: [
                        {
                            title: "Keyboard Black",
                            sku: "KEYBOARD-BLACK",
                            options: {
                                Color: "Black",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 99,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 99,
                                    currency_code: "usd",
                                },
                            ],
                        },
                        {
                            title: "Keyboard White",
                            sku: "KEYBOARD-WHITE",
                            options: {
                                Color: "White",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 99,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 99,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });
    await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: "Wireless Rechargeable Mouse | Multi-Touch Surface",
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Accessories")?.id,
                    ],
                    description: `This wireless keyboard offers a comfortable typing experience with a numeric keypad and Touch ID. It features navigation buttons, full-sized arrow keys, and is ideal for spreadsheets and gaming. The rechargeable battery lasts about a month. It pairs automatically with compatible computers and includes a USB-C to Lightning cable for charging and pairing.`,
                    weight: 400,
                    status: utils_1.ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/mouse-top.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/mouse-front.png",
                        },
                    ],
                    options: [
                        {
                            title: "Color",
                            values: ["Black", "White"],
                        },
                    ],
                    variants: [
                        {
                            title: "Mouse Black",
                            sku: "MOUSE-BLACK",
                            options: {
                                Color: "Black",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 79,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 79,
                                    currency_code: "usd",
                                },
                            ],
                        },
                        {
                            title: "Mouse White",
                            sku: "MOUSE-WHITE",
                            options: {
                                Color: "White",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 79,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 79,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });
    await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: "Conference Speaker | High-Performance | Budget-Friendly",
                    category_ids: [
                        categoryResult.find((cat) => cat.name === "Accessories")?.id,
                    ],
                    description: `This compact, powerful conference speaker offers exceptional, high-performance features at a surprisingly affordable price. Packed with advanced productivity-enhancing technology, it delivers premium functionality without the premium price tag. Experience better meetings and improved communication, regardless of where your team members are calling from.`,
                    weight: 400,
                    status: utils_1.ProductStatus.PUBLISHED,
                    images: [
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/speaker-top.png",
                        },
                        {
                            url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/speaker-front.png",
                        },
                    ],
                    options: [
                        {
                            title: "Color",
                            values: ["Black", "White"],
                        },
                    ],
                    variants: [
                        {
                            title: "Speaker Black",
                            sku: "SPEAKER-BLACK",
                            options: {
                                Color: "Black",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 79,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 79,
                                    currency_code: "usd",
                                },
                            ],
                        },
                        {
                            title: "Speaker White",
                            sku: "SPEAKER-WHITE",
                            options: {
                                Color: "White",
                            },
                            manage_inventory: false,
                            prices: [
                                {
                                    amount: 55,
                                    currency_code: "eur",
                                },
                                {
                                    amount: 55,
                                    currency_code: "usd",
                                },
                            ],
                        },
                    ],
                    sales_channels: [
                        {
                            id: defaultSalesChannel[0].id,
                        },
                    ],
                },
            ],
        },
    });
    logger.info("Finished seeding product data.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3NlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUE0QkEsK0JBKzZCQztBQTM4QkQscURBYzhCO0FBTzlCLHFEQUttQztBQUVwQixLQUFLLFVBQVUsWUFBWSxDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQ2hFLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkUsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvRCxNQUFNLHdCQUF3QixHQUE4QixTQUFTLENBQUMsT0FBTyxDQUMzRSw4QkFBc0IsQ0FBQyxXQUFXLENBQ25DLENBQUM7SUFDRixNQUFNLHlCQUF5QixHQUM3QixTQUFTLENBQUMsT0FBTyxDQUFDLDhCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzFELE1BQU0sa0JBQWtCLEdBQXdCLFNBQVMsQ0FBQyxPQUFPLENBQy9ELDhCQUFzQixDQUFDLEtBQUssQ0FDN0IsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFN0QsTUFBTSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RELElBQUksbUJBQW1CLEdBQUcsTUFBTSx5QkFBeUIsQ0FBQyxpQkFBaUIsQ0FBQztRQUMxRSxJQUFJLEVBQUUsdUJBQXVCO0tBQzlCLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQyxtQ0FB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