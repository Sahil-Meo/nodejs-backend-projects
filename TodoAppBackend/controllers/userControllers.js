import User from '../models/user.models.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
// import validator from 'validator'
// import rateLimit from 'express-rate-limit'

/*     // Rate limiting middleware
export const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // limit each IP to 5 requests per windowMs
     message: {
          success: false,
          message: 'Too many login attempts, please try again later.'
     },
     standardHeaders: true,
     legacyHeaders: false,
})    */


const validateInput = {
     email: (email) => {
          if (!email) {
               return 'Please provide a valid email address'
          }
          return null
     },

     password: (password) => {
          if (!password || password.length < 6) {
               return 'Password must be at least 6 characters long'
          }
          return null
     },

     name: (name) => {
          if (!name || name.trim().length < 2) {
               return 'Name must be at least 2 characters long'
          }
          return null
     }
}

const sendErrorResponse = (res, statusCode, message, error) => {
     if (process.env.NODE_ENV === 'development' && error) {
          console.error(error)
     }

     res.status(statusCode).json({
          success: false,
          message,
          error,
          timestamp: new Date().toISOString()
     })
}

const sendSuccessResponse = (res, statusCode, message, data = {}) => {
     res.status(statusCode).json({
          success: true,
          message,
          timestamp: new Date().toISOString(),
          ...data
     })
}

export const getUsers = async (req, res) => {
     try {
          // Add pagination for large datasets
          const page = parseInt(req.query.page) || 1
          const limit = parseInt(req.query.limit) || 10
          const skip = (page - 1) * limit

          const users = await User.find()
               .select('-password')
               .skip(skip)
               .limit(limit)
               .lean() // Better performance

          const total = await User.countDocuments()

          sendSuccessResponse(res, 200, "Users fetched successfully", {
               users,
               pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
               }
          })
     } catch (error) {
          sendErrorResponse(res, 500, 'Failed to fetch users', error)
     }
}

export const createUser = async (req, res) => {
     try {
          const { name, email, password } = req.body

          const nameError = validateInput.name(name)
          const emailError = validateInput.email(email)
          const passwordError = validateInput.password(password)

          if (nameError || emailError || passwordError) {
               return sendErrorResponse(res, 400,
                    nameError || emailError || passwordError
               )
          }

          // Sanitize inputs
          // const sanitizedName = validator.escape(name.trim())
          // const sanitizedEmail = validator.normalizeEmail(email.toLowerCase())

          // Check if user exists (using case-insensitive email)
          const existingUser = await User.findOne({ email })
          
          if (existingUser) {
               return sendErrorResponse(res, 409, 'Account with this email already exists')
          }
          
          console.log(`user exist`);
          const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10
          const hashedPassword = await bcrypt.hash(password, saltRounds)

          const newUser = new User({
               name,
               email,
               password: hashedPassword
          })
          await newUser.save()

          const payload = {
               user: {
                    id: newUser._id,
                    email: newUser.email
               }
          }

          const token = jwt.sign(
               payload,
               process.env.JWT_SECRET,
               {
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
                    issuer: 'TodoApp',
                    audience: 'TodoAppUsers'
               }
          )

          if (process.env.NODE_ENV === 'production') {
               res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
               })
          }

          sendSuccessResponse(res, 201, "Account created successfully", {
               token,
               user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    createdAt: newUser.createdAt
               }
          })

     } catch (error) {
          console.error('Error creating user:', error)
          sendErrorResponse(res, 500, 'Failed to create account', error)
     }
}

export const loginUser = async (req, res) => {
     try {
          const { email, password } = req.body


          const emailError = validateInput.email(email)
          const passwordError = validateInput.password(password)

          if (emailError || passwordError) {
               return sendErrorResponse(res, 400, 'Please provide valid email and password')
          }


          // const sanitizedEmail = validator.normalizeEmail(email.toLowerCase())


          const user = await User.findOne({
               email: { $regex: new RegExp(`^${sanitizedEmail}$`, 'i') }
          }).select('+password') // Include password for comparison

          // Generic error message for security
          const invalidCredentialsMsg = 'Invalid email or password'

          if (!user) {
               return sendErrorResponse(res, 401, invalidCredentialsMsg)
          }

          // Check if account is locked/disabled (if you implement this feature)
          if (user.isLocked) {
               return sendErrorResponse(res, 423, 'Account is temporarily locked')
          }

          // Compare password
          const isValidPassword = await bcrypt.compare(password, user.password)

          if (!isValidPassword) {
               // Log failed attempt (implement failed login tracking)
               await User.findByIdAndUpdate(user._id, {
                    $inc: { failedLoginAttempts: 1 },
                    lastFailedLogin: new Date()
               })

               return sendErrorResponse(res, 401, invalidCredentialsMsg)
          }

          // Reset failed login attempts on successful login
          await User.findByIdAndUpdate(user._id, {
               $unset: { failedLoginAttempts: 1, lastFailedLogin: 1 },
               lastLogin: new Date()
          })

          // Generate JWT
          const payload = {
               user: {
                    id: user._id,
                    email: user.email
               }
          }

          const token = jwt.sign(
               payload,
               process.env.JWT_SECRET,
               {
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
                    issuer: 'your-app-name',
                    audience: 'your-app-users'
               }
          )

          // Set secure HTTP-only cookie in production
          if (process.env.NODE_ENV === 'production') {
               res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000
               })
          }

          sendSuccessResponse(res, 200, "Login successful", {
               token: process.env.NODE_ENV !== 'production' ? token : undefined,
               user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    lastLogin: new Date()
               }
          })

     } catch (error) {
          sendErrorResponse(res, 500, 'Login failed', error)
     }
}

export const fetchSingleUser = async (req, res) => {
     try {
          const userId = req.user.id

          if (!userId) {
               return sendErrorResponse(res, 401, 'User not authenticated')
          }

          const user = await User.findById(userId)
               .select('-password -failedLoginAttempts -lastFailedLogin')
               .lean()

          if (!user) {
               return sendErrorResponse(res, 404, 'User not found')
          }

          sendSuccessResponse(res, 200, "User profile fetched successfully", {
               user
          })

     } catch (error) {
          sendErrorResponse(res, 500, 'Failed to fetch user profile', error)
     }
}

export const logoutUser = async (req, res) => {
     try {
          // Clear HTTP-only cookie
          res.clearCookie('authToken', {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict'
          })

          sendSuccessResponse(res, 200, "Logged out successfully")
     } catch (error) {
          sendErrorResponse(res, 500, 'Logout failed', error)
     }
}

// Middleware to verify JWT
export const authenticateToken = (req, res, next) => {
     try {
          // Get token from cookie or Authorization header
          let token = req.cookies?.authToken ||
               req.header('Authorization')?.replace('Bearer ', '')

          if (!token) {
               return sendErrorResponse(res, 401, 'Access denied. No token provided.')
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          req.user = decoded.user
          next()
     } catch (error) {
          if (error.name === 'TokenExpiredError') {
               return sendErrorResponse(res, 401, 'Token expired')
          } else if (error.name === 'JsonWebTokenError') {
               return sendErrorResponse(res, 401, 'Invalid token')
          }
          sendErrorResponse(res, 500, 'Token verification failed')
     }
}