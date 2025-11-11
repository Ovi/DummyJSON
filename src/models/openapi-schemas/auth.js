/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication
 *
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Username for authentication
 *           example: "emilys"
 *         password:
 *           type: string
 *           description: Password for authentication
 *           example: "emilyspass"
 *         expiresInMins:
 *           type: integer
 *           description: Token expiration time in minutes
 *           default: 60
 *           example: 60
 *       required:
 *         - username
 *         - password
 *
 *     RefreshTokenRequest:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh token obtained from login or previous token refresh
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         expiresInMins:
 *           type: integer
 *           description: Token expiration time in minutes
 *           default: 60
 *           example: 60
 *       required:
 *         - refreshToken
 *
 *     UserAuth:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         username:
 *           type: string
 *           description: Username of authenticated user
 *           example: "emilys"
 *         email:
 *           type: string
 *           description: Email of authenticated user
 *           example: "emily.johnson@x.dummyjson.com"
 *         firstName:
 *           type: string
 *           description: First name of user
 *           example: "Emily"
 *         lastName:
 *           type: string
 *           description: Last name of user
 *           example: "Johnson"
 *         gender:
 *           type: string
 *           description: Gender of user
 *           example: "female"
 *         image:
 *           type: string
 *           description: Profile image URL
 *           example: "https://dummyjson.com/icon/emilys/128"
 *       required:
 *         - id
 *         - username
 *         - email
 *         - firstName
 *         - lastName
 *
 *     AuthResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/UserAuth'
 *         - type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: JWT Access Token
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             refreshToken:
 *               type: string
 *               description: JWT Refresh Token for obtaining a new access token
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           required:
 *             - accessToken
 *             - refreshToken
 *
 *     TokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: New JWT access token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           description: New JWT refresh token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       required:
 *         - accessToken
 *         - refreshToken
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
