/**
 * @openapi
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the recipe
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the recipe
 *           example: "Classic Margherita Pizza"
 *         ingredients:
 *           type: array
 *           description: List of ingredients
 *           items:
 *             type: string
 *           example: ["Pizza dough", "Tomato sauce", "Fresh mozzarella cheese"]
 *         instructions:
 *           type: array
 *           description: Step-by-step instructions
 *           items:
 *             type: string
 *           example: ["Preheat the oven to 475°F (245°C).", "Roll out the pizza dough and spread tomato sauce evenly."]
 *         prepTimeMinutes:
 *           type: integer
 *           description: Preparation time in minutes
 *           example: 20
 *         cookTimeMinutes:
 *           type: integer
 *           description: Cooking time in minutes
 *           example: 15
 *         servings:
 *           type: integer
 *           description: Number of servings
 *           example: 4
 *         difficulty:
 *           type: string
 *           description: Difficulty level
 *           example: "Easy"
 *         cuisine:
 *           type: string
 *           description: Cuisine type
 *           example: "Italian"
 *         caloriesPerServing:
 *           type: integer
 *           description: Calories per serving
 *           example: 300
 *         tags:
 *           type: array
 *           description: Tags associated with the recipe
 *           items:
 *             type: string
 *           example: ["Pizza", "Italian"]
 *         userId:
 *           type: integer
 *           description: User ID of the recipe creator
 *           example: 45
 *         image:
 *           type: string
 *           description: URL to the recipe image
 *           example: "https://cdn.dummyjson.com/recipe-images/1.webp"
 *         rating:
 *           type: number
 *           description: Average rating (0-5)
 *           example: 4.6
 *         reviewCount:
 *           type: integer
 *           description: Number of reviews
 *           example: 3
 *         mealType:
 *           type: array
 *           description: Meal types (e.g., Breakfast, Lunch, Dinner)
 *           items:
 *             type: string
 *           example: ["Dinner"]
 *       required:
 *         - id
 *         - name
 *         - ingredients
 *         - instructions
 *         - prepTimeMinutes
 *         - cookTimeMinutes
 *         - servings
 *         - difficulty
 *         - cuisine
 *         - caloriesPerServing
 *         - tags
 *         - userId
 *         - image
 *         - rating
 *         - mealType
 *
 *     RecipesResponse:
 *       type: object
 *       properties:
 *         recipes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Recipe'
 *         total:
 *           type: integer
 *           description: Total number of recipes
 *           example: 100
 *         skip:
 *           type: integer
 *           description: Number of recipes skipped for pagination
 *           example: 0
 *         limit:
 *           type: integer
 *           description: Maximum number of recipes returned
 *           example: 30
 *
 *     AddRecipeRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Tasty Pizza"
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *         prepTimeMinutes:
 *           type: integer
 *         cookTimeMinutes:
 *           type: integer
 *         servings:
 *           type: integer
 *         difficulty:
 *           type: string
 *         cuisine:
 *           type: string
 *         caloriesPerServing:
 *           type: integer
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         userId:
 *           type: integer
 *         image:
 *           type: string
 *         rating:
 *           type: number
 *         reviewCount:
 *           type: integer
 *         mealType:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - name
 *         - ingredients
 *         - instructions
 *         - prepTimeMinutes
 *         - cookTimeMinutes
 *         - servings
 *         - difficulty
 *         - cuisine
 *         - caloriesPerServing
 *         - tags
 *         - userId
 *         - image
 *         - rating
 *         - mealType
 *
 *     UpdateRecipeRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *         prepTimeMinutes:
 *           type: integer
 *         cookTimeMinutes:
 *           type: integer
 *         servings:
 *           type: integer
 *         difficulty:
 *           type: string
 *         cuisine:
 *           type: string
 *         caloriesPerServing:
 *           type: integer
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         userId:
 *           type: integer
 *         image:
 *           type: string
 *         rating:
 *           type: number
 *         reviewCount:
 *           type: integer
 *         mealType:
 *           type: array
 *           items:
 *             type: string
 *
 *     DeletedRecipeResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Recipe'
 *         - type: object
 *           properties:
 *             isDeleted:
 *               type: boolean
 *               description: Whether the recipe is deleted
 *               example: true
 *             deletedOn:
 *               type: string
 *               format: date-time
 *               description: ISO timestamp when the recipe was deleted
 *               example: "2024-05-01T12:34:56.789Z"
 *           required:
 *             - isDeleted
 *             - deletedOn
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
