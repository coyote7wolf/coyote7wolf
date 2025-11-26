/**
 * Form Validation System - Core Validators
 *
 * Built-in validation rules and custom validator support
 * with comprehensive error handling and internationalization.
 */

import { ValidationRule, ValidationContext } from './types'

/**
 * Built-in Validation Rules
 */
export class ValidationRules {
  /**
   * Required field validation
   */
  static required(value: any): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'boolean') return true
    if (typeof value === 'number') return !isNaN(value)
    return true
  }

  /**
   * Email validation
   */
  static email(value: string): boolean {
    if (!value) return true // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  /**
   * URL validation
   */
  static url(value: string): boolean {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * Number validation
   */
  static number(value: any): boolean {
    if (!value && value !== 0) return true
    return !isNaN(Number(value)) && isFinite(Number(value))
  }

  /**
   * Integer validation
   */
  static integer(value: any): boolean {
    if (!value && value !== 0) return true
    return Number.isInteger(Number(value))
  }

  /**
   * Minimum value validation
   */
  static min(value: any, minValue: number): boolean {
    if (!value && value !== 0) return true
    return Number(value) >= minValue
  }

  /**
   * Maximum value validation
   */
  static max(value: any, maxValue: number): boolean {
    if (!value && value !== 0) return true
    return Number(value) <= maxValue
  }

  /**
   * Minimum length validation
   */
  static minLength(value: string | any[], minLength: number): boolean {
    if (!value) return true
    return value.length >= minLength
  }

  /**
   * Maximum length validation
   */
  static maxLength(value: string | any[], maxLength: number): boolean {
    if (!value) return true
    return value.length <= maxLength
  }

  /**
   * Pattern validation
   */
  static pattern(value: string, pattern: RegExp): boolean {
    if (!value) return true
    return pattern.test(value)
  }

  /**
   * Date validation
   */
  static date(value: string): boolean {
    if (!value) return true
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  /**
   * Phone number validation (international format)
   */
  static phoneNumber(value: string): boolean {
    if (!value) return true
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))
  }

  /**
   * Credit card validation (Luhn algorithm)
   */
  static creditCard(value: string): boolean {
    if (!value) return true
    const cleaned = value.replace(/\s/g, '')
    if (!/^\d+$/.test(cleaned)) return false

    let sum = 0
    let shouldDouble = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i] || '0')

      if (shouldDouble) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      shouldDouble = !shouldDouble
    }

    return sum % 10 === 0
  }

  /**
   * Postal code validation (flexible for different countries)
   */
  static postalCode(value: string, country = 'US'): boolean {
    if (!value) return true

    const patterns = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
      UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
      DE: /^\d{5}$/,
      FR: /^\d{5}$/,
      generic: /^[A-Za-z0-9\s\-]{3,10}$/,
    }

    const pattern =
      patterns[country as keyof typeof patterns] || patterns.generic
    return pattern.test(value)
  }
}

/**
 * Validation Error Messages
 */
export class ValidationMessages {
  private static messages: Record<
    string,
    Record<ValidationRule | string, string>
  > = {
    en: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      url: 'Please enter a valid URL',
      number: 'Please enter a valid number',
      integer: 'Please enter a valid integer',
      min: 'Value must be at least {min}',
      max: 'Value must be at most {max}',
      minLength: 'Must be at least {minLength} characters',
      maxLength: 'Must be at most {maxLength} characters',
      pattern: 'Please match the required format',
      date: 'Please enter a valid date',
      phoneNumber: 'Please enter a valid phone number',
      creditCard: 'Please enter a valid credit card number',
      postalCode: 'Please enter a valid postal code',
      custom: 'Please enter a valid value',
    },
    zh: {
      required: '此字段為必填項',
      email: '請輸入有效的電子郵件地址',
      url: '請輸入有效的網址',
      number: '請輸入有效的數字',
      integer: '請輸入有效的整數',
      min: '值必須至少為 {min}',
      max: '值最多為 {max}',
      minLength: '至少需要 {minLength} 個字符',
      maxLength: '最多 {maxLength} 個字符',
      pattern: '請匹配所需格式',
      date: '請輸入有效的日期',
      phoneNumber: '請輸入有效的電話號碼',
      creditCard: '請輸入有效的信用卡號',
      postalCode: '請輸入有效的郵政編碼',
      custom: '請輸入有效值',
    },
  }

  static getMessage(
    rule: ValidationRule | string,
    locale = 'en',
    params?: Record<string, any>
  ): string {
    const localeMessages = this.messages[locale] || this.messages.en
    let message =
      localeMessages?.[rule] || localeMessages?.custom || 'Validation failed'

    // Replace parameters in message
    if (params && message) {
      Object.keys(params).forEach(key => {
        message = message.replace(`{${key}}`, params[key])
      })
    }

    return message
  }

  static setMessages(locale: string, messages: Record<string, string>): void {
    this.messages[locale] = { ...this.messages[locale], ...messages }
  }

  static addMessage(locale: string, rule: string, message: string): void {
    if (!this.messages[locale]) {
      this.messages[locale] = {}
    }
    this.messages[locale][rule] = message
  }
}

/**
 * Field Validator Implementation
 */
export class FormFieldValidator {
  private rules: ValidationRule[] = []
  private customValidators: FormFieldValidator[] = []
  private params: Record<string, any> = {}
  private locale = 'en'

  constructor(rules: ValidationRule[] = [], params: Record<string, any> = {}) {
    this.rules = rules
    this.params = params
  }

  /**
   * Add validation rule
   */
  addRule(rule: ValidationRule, params?: any): this {
    this.rules.push(rule)
    if (params !== undefined) {
      this.params[rule] = params
    }
    return this
  }

  /**
   * Add custom validator
   */
  addCustom(validator: FormFieldValidator): this {
    this.customValidators.push(validator)
    return this
  }

  /**
   * Set locale for error messages
   */
  setLocale(locale: string): this {
    this.locale = locale
    return this
  }

  /**
   * Validate value
   */
  validate(value: any, context?: ValidationContext): string | null {
    // Check built-in rules
    for (const rule of this.rules) {
      const isValid = this.validateRule(rule, value, this.params[rule])
      if (!isValid) {
        return ValidationMessages.getMessage(rule, this.locale, this.params)
      }
    }

    // Check custom validators
    for (const validator of this.customValidators) {
      const error = validator.validate(value, context)
      if (error) {
        return error
      }
    }

    return null
  }

  /**
   * Async validation
   */
  async validateAsync(
    value: any,
    context?: ValidationContext
  ): Promise<string | null> {
    // First run sync validation
    const syncError = this.validate(value, context)
    if (syncError) {
      return syncError
    }

    // Then run async custom validators
    for (const validator of this.customValidators) {
      if (validator.validateAsync) {
        const error = await validator.validateAsync(value, context)
        if (error) {
          return error
        }
      }
    }

    return null
  }

  /**
   * Validate single rule
   */
  private validateRule(
    rule: ValidationRule,
    value: any,
    params?: any
  ): boolean {
    switch (rule) {
      case 'required':
        return ValidationRules.required(value)
      case 'email':
        return ValidationRules.email(value)
      case 'url':
        return ValidationRules.url(value)
      case 'number':
        return ValidationRules.number(value)
      case 'integer':
        return ValidationRules.integer(value)
      case 'min':
        return ValidationRules.min(value, params)
      case 'max':
        return ValidationRules.max(value, params)
      case 'minLength':
        return ValidationRules.minLength(value, params)
      case 'maxLength':
        return ValidationRules.maxLength(value, params)
      case 'pattern':
        return ValidationRules.pattern(value, params)
      case 'date':
        return ValidationRules.date(value)
      case 'phoneNumber':
        return ValidationRules.phoneNumber(value)
      case 'creditCard':
        return ValidationRules.creditCard(value)
      case 'postalCode':
        return ValidationRules.postalCode(value, params)
      default:
        return true
    }
  }
}

/**
 * Validation Utilities
 */
export class ValidationUtils {
  /**
   * Create validator from schema
   */
  static createValidator(
    rules: ValidationRule[],
    params: Record<string, any> = {},
    locale = 'en'
  ): FormFieldValidator {
    return new FormFieldValidator(rules, params).setLocale(locale)
  }

  /**
   * Validate single value
   */
  static validateValue(
    value: any,
    rules: ValidationRule[],
    params: Record<string, any> = {},
    locale = 'en'
  ): string | null {
    const validator = this.createValidator(rules, params, locale)
    return validator.validate(value)
  }

  /**
   * Validate object against schema
   */
  static validateObject(
    values: Record<string, any>,
    schema: Record<
      string,
      { rules: ValidationRule[]; params?: Record<string, any> }
    >,
    locale = 'en'
  ): Record<string, string> {
    const errors: Record<string, string> = {}

    Object.keys(schema).forEach(field => {
      const fieldConfig = schema[field]
      if (fieldConfig) {
        const value = values[field]
        const error = this.validateValue(
          value,
          fieldConfig.rules,
          fieldConfig.params,
          locale
        )

        if (error) {
          errors[field] = error
        }
      }
    })

    return errors
  }

  /**
   * Debounce validation
   */
  static debounceValidation<T extends any[]>(
    fn: (...args: T) => void,
    delay: number
  ): (...args: T) => void {
    let timeoutId: NodeJS.Timeout

    return (...args: T) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }

  /**
   * Check if value is empty
   */
  static isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    )
  }

  /**
   * Sanitize value
   */
  static sanitizeValue(value: any, type: string): any {
    if (this.isEmpty(value)) return value

    switch (type) {
      case 'number':
        return Number(value)
      case 'integer':
        return parseInt(value, 10)
      case 'string':
        return String(value).trim()
      case 'email':
        return String(value).toLowerCase().trim()
      case 'url':
        return String(value).trim()
      default:
        return value
    }
  }
}

// Export commonly used validators
export const validators = {
  required: () => new FormFieldValidator(['required']),
  email: () => new FormFieldValidator(['email']),
  url: () => new FormFieldValidator(['url']),
  number: (min?: number, max?: number) => {
    const validator = new FormFieldValidator(['number'])
    if (min !== undefined) validator.addRule('min', min)
    if (max !== undefined) validator.addRule('max', max)
    return validator
  },
  string: (minLength?: number, maxLength?: number) => {
    const validator = new FormFieldValidator([])
    if (minLength !== undefined) validator.addRule('minLength', minLength)
    if (maxLength !== undefined) validator.addRule('maxLength', maxLength)
    return validator
  },
  pattern: (regex: RegExp) =>
    new FormFieldValidator(['pattern'], { pattern: regex }),
  phoneNumber: () => new FormFieldValidator(['phoneNumber']),
} as const
