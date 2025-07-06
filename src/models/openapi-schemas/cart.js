/**
 * @openapi
 * components:
 *   schemas:
 *     CartProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Product ID in the cart
 *           example: 168
 *         title:
 *           type: string
 *           description: Product title
 *           example: "Charger SXT RWD"
 *         price:
 *           type: number
 *           description: Product price
 *           example: 32999.99
 *         quantity:
 *           type: integer
 *           description: Quantity of this product in the cart
 *           example: 3
 *         total:
 *           type: number
 *           description: Total price for this product (price * quantity)
 *           example: 98999.97
 *         discountPercentage:
 *           type: number
 *           description: Discount percentage for this product
 *           example: 13.39
 *         discountedTotal:
 *           type: number
 *           description: Discounted total for this product
 *           example: 85743.87
 *         thumbnail:
 *           type: string
 *           description: Product thumbnail URL
 *           example: "https://cdn.dummyjson.com/products/images/vehicle/Charger%20SXT%20RWD/thumbnail.png"
 *       required:
 *         - id
 *         - title
 *         - price
 *         - quantity
 *         - total
 *         - discountPercentage
 *         - discountedTotal
 *         - thumbnail
 *
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Cart ID
 *           example: 1
 *         products:
 *           type: array
 *           description: List of products in the cart
 *           items:
 *             $ref: '#/components/schemas/CartProduct'
 *         total:
 *           type: number
 *           description: Total price of all products in the cart
 *           example: 103774.85
 *         discountedTotal:
 *           type: number
 *           description: Total price after discounts
 *           example: 89686.65
 *         userId:
 *           type: integer
 *           description: User ID who owns the cart
 *           example: 33
 *         totalProducts:
 *           type: integer
 *           description: Number of different products in the cart
 *           example: 4
 *         totalQuantity:
 *           type: integer
 *           description: Total quantity of all products in the cart
 *           example: 15
 *       required:
 *         - id
 *         - products
 *         - total
 *         - discountedTotal
 *         - userId
 *         - totalProducts
 *         - totalQuantity
 *
 *     CartsResponse:
 *       type: object
 *       properties:
 *         carts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Cart'
 *         total:
 *           type: integer
 *           description: Total number of carts
 *           example: 50
 *         skip:
 *           type: integer
 *           description: Number of carts skipped for pagination
 *           example: 0
 *         limit:
 *           type: integer
 *           description: Maximum number of carts returned
 *           example: 30
 *
 *     SingleCartResponse:
 *       $ref: '#/components/schemas/Cart'
 *
 *     AddCartRequest:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           description: User ID for the new cart
 *           example: 1
 *         products:
 *           type: array
 *           description: Array of products to add to the cart
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Product ID
 *                 example: 144
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the product
 *                 example: 4
 *           example:
 *             - id: 144
 *               quantity: 4
 *             - id: 98
 *               quantity: 1
 *       required:
 *         - userId
 *         - products
 *
 *     UpdateCartRequest:
 *       type: object
 *       properties:
 *         merge:
 *           type: boolean
 *           description: Whether to merge with existing cart products
 *           example: true
 *         userId:
 *           type: integer
 *           description: User ID for the cart
 *           example: 1
 *         products:
 *           type: array
 *           description: Array of products to update in the cart
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Product ID
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the product
 *                 example: 1
 *           example:
 *             - id: 1
 *               quantity: 1
 *
 *     DeletedCartResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Cart'
 *         - type: object
 *           properties:
 *             isDeleted:
 *               type: boolean
 *               description: Whether the cart is deleted
 *               example: true
 *             deletedOn:
 *               type: string
 *               format: date-time
 *               description: ISO timestamp when the cart was deleted
 *               example: "2024-05-01T12:34:56.789Z"
 *           required:
 *             - isDeleted
 *             - deletedOn
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
