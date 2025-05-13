/**
 * @openapi
 * components:
 *   schemas:
 *     ProductReview:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Review ID
 *           example: 1
 *         userId:
 *           type: integer
 *           description: User ID of the reviewer
 *           example: 5
 *         username:
 *           type: string
 *           description: Username of the reviewer
 *           example: johnsmith
 *         rating:
 *           type: number
 *           format: float
 *           description: Rating given by the reviewer (0-5)
 *           example: 4.8
 *         comment:
 *           type: string
 *           description: Review comment
 *           example: "Great product, exactly as described!"
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date when the review was posted
 *           example: "2023-01-15T10:30:00Z"
 *       required:
 *         - id
 *         - userId
 *         - rating
 *
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the product
 *           example: 1
 *         title:
 *           type: string
 *           description: Name of the product
 *           example: "Essence Mascara Lash Princess"
 *         description:
 *           type: string
 *           description: Detailed description of the product
 *           example: "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula."
 *         price:
 *           type: number
 *           description: Current price of the product
 *           example: 9.99
 *         discountPercentage:
 *           type: number
 *           description: Discount percentage for the product
 *           example: 7.17
 *         rating:
 *           type: number
 *           description: Average product rating (0-5)
 *           example: 4.94
 *         stock:
 *           type: integer
 *           description: Available stock quantity
 *           example: 5
 *         brand:
 *           type: string
 *           description: Brand name of the product
 *           example: "Essence"
 *         category:
 *           type: string
 *           description: Product category
 *           example: "beauty"
 *         thumbnail:
 *           type: string
 *           description: URL to the product thumbnail image
 *           example: "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png"
 *         images:
 *           type: array
 *           description: URLs to product images
 *           items:
 *             type: string
 *           example: ["https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png"]
 *         tags:
 *           type: array
 *           description: Tags associated with the product
 *           items:
 *             type: string
 *           example: ["mascara"]
 *         sku:
 *           type: string
 *           description: Stock keeping unit identifier
 *           example: "RCH45Q1A"
 *         weight:
 *           type: integer
 *           description: Weight of the product
 *           example: 2
 *         dimensions:
 *           type: object
 *           description: Product dimensions
 *           properties:
 *             depth:
 *               type: number
 *               example: 28.01
 *         warrantyInformation:
 *           type: string
 *           description: Warranty information
 *           example: "1 month warranty"
 *         shippingInformation:
 *           type: string
 *           description: Shipping information
 *           example: "Ships in 1 month"
 *         availabilityStatus:
 *           type: string
 *           description: Product availability status
 *           example: "Low Stock"
 *         returnPolicy:
 *           type: string
 *           description: Return policy information
 *           example: "30 days return policy"
 *         minimumOrderQuantity:
 *           type: integer
 *           description: Minimum order quantity
 *           example: 24
 *         meta:
 *           type: object
 *           description: Additional metadata
 *           properties:
 *             qrCode:
 *               type: string
 *               example: "https://assets.dummyjson.com/public/qr-code.png"
 *       required:
 *         - id
 *         - title
 *         - description
 *         - price
 *         - category
 *         - thumbnail
 *
 *     ProductsResponse:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *         total:
 *           type: integer
 *           description: Total number of products
 *           example: 100
 *         skip:
 *           type: integer
 *           description: Number of products skipped for pagination
 *           example: 0
 *         limit:
 *           type: integer
 *           description: Maximum number of products returned
 *           example: 30
 *
 *     SingleProductResponse:
 *       $ref: '#/components/schemas/Product'
 *
 *     AddProductRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Essence Mascara Lash Princess"
 *         description:
 *           type: string
 *           example: "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects."
 *         price:
 *           type: number
 *           example: 9.99
 *         discountPercentage:
 *           type: number
 *           example: 7.17
 *         rating:
 *           type: number
 *           example: 4.94
 *         stock:
 *           type: integer
 *           example: 5
 *         brand:
 *           type: string
 *           example: "Essence"
 *         category:
 *           type: string
 *           example: "beauty"
 *         thumbnail:
 *           type: string
 *           example: "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png"
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png"]
 *       required:
 *         - title
 *         - price
 *         - category
 *
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated Essence Mascara"
 *         price:
 *           type: number
 *           example: 12.99
 *         stock:
 *           type: integer
 *           example: 10
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
