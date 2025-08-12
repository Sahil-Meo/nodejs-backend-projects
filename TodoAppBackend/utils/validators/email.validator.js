import validator from 'validator'

// Email validation
export const validateEmail = (email) => {
  const errors = []

  // Check if email is provided
  if (!email) {
    errors.push('Email is required')
    return { isValid: false, errors }
  }

  // Check if email is a string
  if (typeof email !== 'string') {
    errors.push('Email must be a string')
    return { isValid: false, errors }
  }

  // Trim whitespace
  email = email.trim()

  // Check if email is not empty after trimming
  if (email.length === 0) {
    errors.push('Email cannot be empty')
    return { isValid: false, errors }
  }

  // Check email format
  if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address')
    return { isValid: false, errors }
  }

  // Check email length
  if (email.length > 254) {
    errors.push('Email address is too long (maximum 254 characters)')
    return { isValid: false, errors }
  }

  // Additional email checks
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    errors.push('Email format is invalid')
    return { isValid: false, errors }
  }

  // Check for common disposable email domains (optional)
  const disposableEmailDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'throwaway.email'
  ]

  const emailDomain = email.split('@')[1]?.toLowerCase()
  if (disposableEmailDomains.includes(emailDomain)) {
    errors.push('Disposable email addresses are not allowed')
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    errors: [],
    sanitizedEmail: validator.normalizeEmail(email.toLowerCase())
  }
}

// Password validation
export const validatePassword = (password) => {
  const errors = []

  if (!password) {
    errors.push('Password is required')
    return { isValid: false, errors }
  }

  if (typeof password !== 'string') {
    errors.push('Password must be a string')
    return { isValid: false, errors }
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }

  if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)')
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check for common weak passwords
  const weakPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', '123456789'
  ]

  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password')
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  }
}

// Name validation
export const validateName = (name) => {
  const errors = []

  if (!name) {
    errors.push('Name is required')
    return { isValid: false, errors }
  }

  if (typeof name !== 'string') {
    errors.push('Name must be a string')
    return { isValid: false, errors }
  }

  // Trim whitespace
  name = name.trim()

  if (name.length === 0) {
    errors.push('Name cannot be empty')
    return { isValid: false, errors }
  }

  if (name.length < 2) {
    errors.push('Name must be at least 2 characters long')
  }

  if (name.length > 50) {
    errors.push('Name is too long (maximum 50 characters)')
  }

  // Check for invalid characters
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes')
  }

  // Check for excessive spaces
  if (/\s{2,}/.test(name)) {
    errors.push('Name cannot contain multiple consecutive spaces')
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName: validator.escape(name.trim().replace(/\s+/g, ' '))
  }
}

// Phone validation (optional)
export const validatePhone = (phone) => {
  const errors = []

  if (!phone) {
    errors.push('Phone number is required')
    return { isValid: false, errors }
  }

  if (typeof phone !== 'string') {
    errors.push('Phone number must be a string')
    return { isValid: false, errors }
  }

  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '')

  if (cleanPhone.length < 10) {
    errors.push('Phone number must be at least 10 digits')
  }

  if (cleanPhone.length > 15) {
    errors.push('Phone number is too long (maximum 15 digits)')
  }

  // Check if it's a valid mobile number format
  if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
    errors.push('Please provide a valid phone number')
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedPhone: cleanPhone
  }
}

// Combined user registration validation
export const validateUserRegistration = (userData) => {
  const { name, email, password, phone } = userData
  const errors = []

  // Validate name
  const nameValidation = validateName(name)
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors)
  }

  // Validate email
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors)
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors)
  }

  // Validate phone (optional)
  if (phone) {
    const phoneValidation = validatePhone(phone)
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      name: nameValidation.isValid ? nameValidation.sanitizedName : name,
      email: emailValidation.isValid ? emailValidation.sanitizedEmail : email,
      phone: phone && validatePhone(phone).isValid ? validatePhone(phone).sanitizedPhone : phone
    }
  }
}

// Combined user login validation
export const validateUserLogin = (userData) => {
  const { email, password } = userData
  const errors = []

  // Basic email validation (less strict for login)
  if (!email) {
    errors.push('Email is required')
  } else if (!validator.isEmail(email.trim())) {
    errors.push('Please provide a valid email address')
  }

  // Basic password validation (just check if provided)
  if (!password) {
    errors.push('Password is required')
  } else if (password.length < 1) {
    errors.push('Password cannot be empty')
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      email: email ? validator.normalizeEmail(email.toLowerCase().trim()) : email
    }
  }
}

// Password strength calculator helper
function calculatePasswordStrength(password) {
  let score = 0

  // Length bonus
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character variety
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1

  // Complexity patterns
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) score += 1
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) score += 1

  if (score <= 3) return 'weak'
  if (score <= 6) return 'medium'
  if (score <= 8) return 'strong'
  return 'very-strong'
}

// Utility function to sanitize all input data
export const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return validator.escape(data.trim())
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }

  return data
}

// Generic validation middleware
export const createValidationMiddleware = (validationFunction) => {
  return (req, res, next) => {
    const validation = validationFunction(req.body)

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
        timestamp: new Date().toISOString()
      })
    }

    // Add sanitized data to request
    req.validatedData = validation.sanitizedData || req.body
    next()
  }
}