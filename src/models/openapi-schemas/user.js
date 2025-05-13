/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the user
 *           example: 1
 *         firstName:
 *           type: string
 *           example: "Terry"
 *         lastName:
 *           type: string
 *           example: "Medhurst"
 *         maidenName:
 *           type: string
 *           example: "Smitham"
 *         age:
 *           type: integer
 *           example: 50
 *         gender:
 *           type: string
 *           example: "male"
 *         email:
 *           type: string
 *           example: "atuny0@sohu.com"
 *         phone:
 *           type: string
 *           example: "+63 791 675 8914"
 *         username:
 *           type: string
 *           example: "atuny0"
 *         password:
 *           type: string
 *           example: "9uQFF1Lh"
 *         birthDate:
 *           type: string
 *           example: "2000-12-25"
 *         image:
 *           type: string
 *           example: "https://robohash.org/hicveldicta.png"
 *         bloodGroup:
 *           type: string
 *           example: "A−"
 *         height:
 *           type: integer
 *           example: 189
 *         weight:
 *           type: number
 *           example: 75.4
 *         eyeColor:
 *           type: string
 *           example: "Green"
 *         hair:
 *           type: object
 *           properties:
 *             color:
 *               type: string
 *               example: "Black"
 *             type:
 *               type: string
 *               example: "Strands"
 *         domain:
 *           type: string
 *           example: "slashdot.org"
 *         ip:
 *           type: string
 *           example: "117.29.86.254"
 *         address:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               example: "1745 T Street Southeast"
 *             city:
 *               type: string
 *               example: "Washington"
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                   example: 38.867033
 *                 lng:
 *                   type: number
 *                   example: -76.979235
 *             postalCode:
 *               type: string
 *               example: "20020"
 *             state:
 *               type: string
 *               example: "DC"
 *         macAddress:
 *           type: string
 *           example: "13:69:BA:56:A3:74"
 *         university:
 *           type: string
 *           example: "Capitol University"
 *         bank:
 *           type: object
 *           properties:
 *             cardExpire:
 *               type: string
 *               example: "06/22"
 *             cardNumber:
 *               type: string
 *               example: "50380955204220685"
 *             cardType:
 *               type: string
 *               example: "maestro"
 *             currency:
 *               type: string
 *               example: "Peso"
 *             iban:
 *               type: string
 *               example: "NO17 0695 2754 967"
 *         company:
 *           type: object
 *           properties:
 *             address:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   example: "629 Debbie Drive"
 *                 city:
 *                   type: string
 *                   example: "Nashville"
 *                 coordinates:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                       example: 36.208114
 *                     lng:
 *                       type: number
 *                       example: -86.586211
 *                 postalCode:
 *                   type: string
 *                   example: "37076"
 *                 state:
 *                   type: string
 *                   example: "TN"
 *             department:
 *               type: string
 *               example: "Marketing"
 *             name:
 *               type: string
 *               example: "Blanda-O'Keefe"
 *             title:
 *               type: string
 *               example: "Help Desk Operator"
 *         ein:
 *           type: string
 *           example: "20-9487066"
 *         ssn:
 *           type: string
 *           example: "661-64-2976"
 *         userAgent:
 *           type: string
 *           example: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
 *       required:
 *         - id
 *         - firstName
 *         - lastName
 *         - age
 *         - gender
 *         - email
 *         - phone
 *         - username
 *         - password
 *         - birthDate
 *         - image
 *         - bloodGroup
 *         - height
 *         - weight
 *         - eyeColor
 *         - hair
 *         - domain
 *         - ip
 *         - address
 *         - macAddress
 *         - university
 *         - bank
 *         - company
 *         - ein
 *         - ssn
 *         - userAgent
 *       example:
 *         id: 1
 *         firstName: "Terry"
 *         lastName: "Medhurst"
 *         maidenName: "Smitham"
 *         age: 50
 *         gender: "male"
 *         email: "atuny0@sohu.com"
 *         phone: "+63 791 675 8914"
 *         username: "atuny0"
 *         password: "9uQFF1Lh"
 *         birthDate: "2000-12-25"
 *         image: "https://robohash.org/hicveldicta.png"
 *         bloodGroup: "A−"
 *         height: 189
 *         weight: 75.4
 *         eyeColor: "Green"
 *         hair:
 *           color: "Black"
 *           type: "Strands"
 *         domain: "slashdot.org"
 *         ip: "117.29.86.254"
 *         address:
 *           address: "1745 T Street Southeast"
 *           city: "Washington"
 *           coordinates:
 *             lat: 38.867033
 *             lng: -76.979235
 *           postalCode: "20020"
 *           state: "DC"
 *         macAddress: "13:69:BA:56:A3:74"
 *         university: "Capitol University"
 *         bank:
 *           cardExpire: "06/22"
 *           cardNumber: "50380955204220685"
 *           cardType: "maestro"
 *           currency: "Peso"
 *           iban: "NO17 0695 2754 967"
 *         company:
 *           address:
 *             address: "629 Debbie Drive"
 *             city: "Nashville"
 *             coordinates:
 *               lat: 36.208114
 *               lng: -86.586211
 *             postalCode: "37076"
 *             state: "TN"
 *           department: "Marketing"
 *           name: "Blanda-O'Keefe"
 *           title: "Help Desk Operator"
 *         ein: "20-9487066"
 *         ssn: "661-64-2976"
 *         userAgent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
 *
 *     UsersResponse:
 *       type: object
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         total:
 *           type: integer
 *           example: 100
 *         skip:
 *           type: integer
 *           example: 0
 *         limit:
 *           type: integer
 *           example: 30
 *       example:
 *         users:
 *           - id: 1
 *             firstName: "Terry"
 *             lastName: "Medhurst"
 *             maidenName: "Smitham"
 *             age: 50
 *             gender: "male"
 *             email: "atuny0@sohu.com"
 *             phone: "+63 791 675 8914"
 *             username: "atuny0"
 *             password: "9uQFF1Lh"
 *             birthDate: "2000-12-25"
 *             image: "https://robohash.org/hicveldicta.png"
 *             bloodGroup: "A−"
 *             height: 189
 *             weight: 75.4
 *             eyeColor: "Green"
 *             hair:
 *               color: "Black"
 *               type: "Strands"
 *             domain: "slashdot.org"
 *             ip: "117.29.86.254"
 *             address:
 *               address: "1745 T Street Southeast"
 *               city: "Washington"
 *               coordinates:
 *                 lat: 38.867033
 *                 lng: -76.979235
 *               postalCode: "20020"
 *               state: "DC"
 *             macAddress: "13:69:BA:56:A3:74"
 *             university: "Capitol University"
 *             bank:
 *               cardExpire: "06/22"
 *               cardNumber: "50380955204220685"
 *               cardType: "maestro"
 *               currency: "Peso"
 *               iban: "NO17 0695 2754 967"
 *             company:
 *               address:
 *                 address: "629 Debbie Drive"
 *                 city: "Nashville"
 *                 coordinates:
 *                   lat: 36.208114
 *                   lng: -86.586211
 *                 postalCode: "37076"
 *                 state: "TN"
 *               department: "Marketing"
 *               name: "Blanda-O'Keefe"
 *               title: "Help Desk Operator"
 *             ein: "20-9487066"
 *             ssn: "661-64-2976"
 *             userAgent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
 *         total: 100
 *         skip: 0
 *         limit: 30
 *
 *     AddUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: "Terry"
 *         lastName:
 *           type: string
 *           example: "Medhurst"
 *         email:
 *           type: string
 *           example: "atuny0@sohu.com"
 *         username:
 *           type: string
 *           example: "atuny0"
 *         password:
 *           type: string
 *           example: "9uQFF1Lh"
 *         age:
 *           type: integer
 *           example: 50
 *         gender:
 *           type: string
 *           example: "male"
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - username
 *         - password
 *         - age
 *         - gender
 *       example:
 *         firstName: "Terry"
 *         lastName: "Medhurst"
 *         email: "atuny0@sohu.com"
 *         username: "atuny0"
 *         password: "9uQFF1Lh"
 *         age: 50
 *         gender: "male"
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: "Terry"
 *         lastName:
 *           type: string
 *           example: "Medhurst"
 *         email:
 *           type: string
 *           example: "atuny0@sohu.com"
 *         username:
 *           type: string
 *           example: "atuny0"
 *         password:
 *           type: string
 *           example: "9uQFF1Lh"
 *         age:
 *           type: integer
 *           example: 50
 *         gender:
 *           type: string
 *           example: "male"
 *       example:
 *         firstName: "Terry"
 *         lastName: "Medhurst"
 *         email: "atuny0@sohu.com"
 *         username: "atuny0"
 *         password: "9uQFF1Lh"
 *         age: 50
 *         gender: "male"
 *
 *     DeletedUserResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             isDeleted:
 *               type: boolean
 *               description: Whether the user is deleted
 *               example: true
 *             deletedOn:
 *               type: string
 *               format: date-time
 *               description: ISO timestamp when the user was deleted
 *               example: "2024-05-01T12:34:56.789Z"
 *           required:
 *             - isDeleted
 *             - deletedOn
 *           example:
 *             id: 1
 *             firstName: "Terry"
 *             lastName: "Medhurst"
 *             maidenName: "Smitham"
 *             age: 50
 *             gender: "male"
 *             email: "atuny0@sohu.com"
 *             phone: "+63 791 675 8914"
 *             username: "atuny0"
 *             password: "9uQFF1Lh"
 *             birthDate: "2000-12-25"
 *             image: "https://robohash.org/hicveldicta.png"
 *             bloodGroup: "A−"
 *             height: 189
 *             weight: 75.4
 *             eyeColor: "Green"
 *             hair:
 *               color: "Black"
 *               type: "Strands"
 *             domain: "slashdot.org"
 *             ip: "117.29.86.254"
 *             address:
 *               address: "1745 T Street Southeast"
 *               city: "Washington"
 *               coordinates:
 *                 lat: 38.867033
 *                 lng: -76.979235
 *               postalCode: "20020"
 *               state: "DC"
 *             macAddress: "13:69:BA:56:A3:74"
 *             university: "Capitol University"
 *             bank:
 *               cardExpire: "06/22"
 *               cardNumber: "50380955204220685"
 *               cardType: "maestro"
 *               currency: "Peso"
 *               iban: "NO17 0695 2754 967"
 *             company:
 *               address:
 *                 address: "629 Debbie Drive"
 *                 city: "Nashville"
 *                 coordinates:
 *                   lat: 36.208114
 *                   lng: -86.586211
 *                 postalCode: "37076"
 *                 state: "TN"
 *               department: "Marketing"
 *               name: "Blanda-O'Keefe"
 *               title: "Help Desk Operator"
 *             ein: "20-9487066"
 *             ssn: "661-64-2976"
 *             userAgent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
 *             isDeleted: true
 *             deletedOn: "2024-05-01T12:34:56.789Z"
 *
 *     UserLoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         id:
 *           type: integer
 *           example: 1
 *         firstName:
 *           type: string
 *           example: "Terry"
 *         lastName:
 *           type: string
 *           example: "Medhurst"
 *         email:
 *           type: string
 *           example: "atuny0@sohu.com"
 *         username:
 *           type: string
 *           example: "atuny0"
 *       example:
 *         accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         id: 1
 *         firstName: "Terry"
 *         lastName: "Medhurst"
 *         email: "atuny0@sohu.com"
 *         username: "atuny0"
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
