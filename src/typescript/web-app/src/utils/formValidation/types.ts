/**
 * Form Validation System - Type Definitions
 *
 * Comprehensive form validation with schema-based validation,
 * real-time feedback, accessibility, and popular library integration.
 */

/**
 * Validation Rule Types
 */
export type ValidationRule =
  | 'required'
  | 'email'
  | 'url'
  | 'number'
  | 'integer'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom'
  | 'date'
  | 'phoneNumber'
  | 'creditCard'
  | 'postalCode'

/**
 * Field Validation Configuration
 */
export interface FieldValidation {
  rules: ValidationRule[]
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  customValidator?: (
    value: any,
    formData?: Record<string, any>
  ) => string | null
  asyncValidator?: (
    value: any,
    formData?: Record<string, any>
  ) => Promise<string | null>
  message?: string
  messages?: Partial<Record<ValidationRule | 'custom' | 'async', string>>
}

/**
 * Form Field Schema
 */
export interface FieldSchema {
  name: string
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'date'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'textarea'
    | 'file'
  label: string
  placeholder?: string
  description?: string
  validation: FieldValidation
  options?: Array<{ value: string | number; label: string }>
  disabled?: boolean
  readOnly?: boolean
  hidden?: boolean
  defaultValue?: any
  dependency?: {
    field: string
    condition: (value: any) => boolean
  }
}

/**
 * Form Schema Definition
 */
export interface FormSchema {
  id: string
  title?: string
  description?: string
  fields: FieldSchema[]
  submitText?: string
  resetText?: string
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all'
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
  shouldFocusError?: boolean
  delayError?: number
  criteriaMode?: 'firstError' | 'all'
}

/**
 * Validation Error
 */
export interface ValidationError {
  field: string
  rule: ValidationRule | 'custom' | 'async'
  message: string
  value?: any
}

/**
 * Field State
 */
export interface FieldState {
  value: any
  error?: ValidationError
  errors?: ValidationError[]
  touched: boolean
  dirty: boolean
  valid: boolean
  validating: boolean
  focused: boolean
}

/**
 * Form State
 */
export interface FormState {
  values: Record<string, any>
  errors: Record<string, ValidationError | ValidationError[]>
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
  valid: boolean
  validating: boolean
  submitting: boolean
  submitted: boolean
  submitCount: number
  fieldStates: Record<string, FieldState>
}

/**
 * Validation Options
 */
export interface ValidationOptions {
  mode?: 'sync' | 'async' | 'mixed'
  abortEarly?: boolean
  stripUnknown?: boolean
  context?: Record<string, any>
  locale?: string
}

/**
 * Form Configuration
 */
export interface FormConfig {
  schema: FormSchema
  initialValues?: Record<string, any>
  onSubmit?: (
    values: Record<string, any>,
    helpers: FormHelpers
  ) => void | Promise<void>
  onValidate?: (
    values: Record<string, any>
  ) => Record<string, string> | Promise<Record<string, string>>
  validateOnMount?: boolean
  enableReinitialize?: boolean
  keepDirtyOnReinitialize?: boolean
}

/**
 * Form Helpers
 */
export interface FormHelpers {
  setFieldValue: (field: string, value: any) => void
  setFieldError: (field: string, error: string) => void
  setFieldTouched: (field: string, touched?: boolean) => void
  setErrors: (errors: Record<string, string>) => void
  setValues: (values: Record<string, any>) => void
  setSubmitting: (submitting: boolean) => void
  resetForm: (values?: Record<string, any>) => void
  validateField: (field: string) => Promise<void>
  validateForm: () => Promise<boolean>
  submitForm: () => Promise<void>
}

/**
 * Validation Context
 */
export interface ValidationContext {
  values: Record<string, any>
  errors: Record<string, ValidationError | ValidationError[]>
  touched: Record<string, boolean>
  isSubmitting: boolean
  locale?: string
}

/**
 * Built-in Validation Messages
 */
export const DEFAULT_VALIDATION_MESSAGES = {
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
  async: 'Validation failed',
} as const

/**
 * Validation Rules Registry
 */
export interface ValidationRuleDefinition {
  name: ValidationRule
  validator: (
    value: any,
    params?: any,
    context?: ValidationContext
  ) => boolean | Promise<boolean>
  message: string
  params?: string[]
}

/**
 * Accessibility Configuration
 */
export interface A11yConfig {
  announceErrors?: boolean
  errorSummary?: boolean
  focusOnError?: boolean
  describedBy?: boolean
  ariaLive?: 'polite' | 'assertive' | 'off'
  errorRole?: 'alert' | 'status'
}

/**
 * Integration Adapters
 */
export interface ReactHookFormAdapter {
  schema: FormSchema
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all'
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
  resolver: any // Resolver function for react-hook-form
}

export interface FormikAdapter {
  schema: FormSchema
  initialValues: Record<string, any>
  validationSchema: any // Yup or Joi schema
  onSubmit: (values: Record<string, any>, actions: any) => void
}

/**
 * Performance Configuration
 */
export interface PerformanceConfig {
  debounceMs?: number
  throttleMs?: number
  validateOnMount?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
  lazy?: boolean
  memoizeValidation?: boolean
}

/**
 * Internationalization Support
 */
export interface I18nConfig {
  locale: string
  messages: Record<string, Record<ValidationRule | string, string>>
  dateFormat?: string
  numberFormat?: Intl.NumberFormatOptions
}

/**
 * Form Analytics
 */
export interface FormAnalytics {
  formId: string
  fieldInteractions: Record<
    string,
    {
      focused: number
      changed: number
      errors: number
    }
  >
  completionTime?: number
  submissionAttempts: number
  abandonmentRate?: number
  errorsByField: Record<string, string[]>
  conversionFunnel: {
    started: number
    progressed: number
    completed: number
  }
}

/**
 * Validation Strategy
 */
export type ValidationStrategy =
  | 'eager'
  | 'lazy'
  | 'progressive'
  | 'conditional'

/**
 * Form Validation System Configuration
 */
export interface FormValidationConfig {
  strategy?: ValidationStrategy
  performance?: PerformanceConfig
  accessibility?: A11yConfig
  internationalization?: I18nConfig
  analytics?: boolean
  debug?: boolean
}

/**
 * Export utility types
 */
export type FormValues = Record<string, any>
export type FormErrors = Record<string, string | string[]>
export type FormTouched = Record<string, boolean>
export type FieldValidator<T = any> = (
  value: T,
  context?: ValidationContext
) => string | null | Promise<string | null>
