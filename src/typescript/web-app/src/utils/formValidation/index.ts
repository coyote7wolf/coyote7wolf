/**
 * Form Validation System - Main Entry Point
 *
 * Simple, complete form validation system with schema-based validation,
 * real-time feedback, and accessibility support.
 */

import { FormSchema, ValidationRule } from './types'
import { FormFieldValidator, ValidationUtils } from './validators'

/**
 * Simple Form State
 */
interface SimpleFormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
}

/**
 * Form Validation Manager
 */
export class FormValidator {
  private schema: FormSchema
  private state: SimpleFormState
  private onStateChange?: (state: SimpleFormState) => void

  constructor(schema: FormSchema, initialValues: Record<string, any> = {}) {
    this.schema = schema
    this.state = {
      values: this.getInitialValues(initialValues),
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false,
    }
  }

  /**
   * Get initial values from schema
   */
  private getInitialValues(provided: Record<string, any>): Record<string, any> {
    const values: Record<string, any> = {}

    this.schema.fields.forEach(field => {
      values[field.name] = provided[field.name] ?? field.defaultValue ?? ''
    })

    return values
  }

  /**
   * Set state change callback
   */
  onChange(callback: (state: SimpleFormState) => void): void {
    this.onStateChange = callback
  }

  /**
   * Update state and notify
   */
  private updateState(updates: Partial<SimpleFormState>): void {
    this.state = { ...this.state, ...updates }
    this.onStateChange?.(this.state)
  }

  /**
   * Get current state
   */
  getState(): SimpleFormState {
    return { ...this.state }
  }

  /**
   * Set field value
   */
  setValue(fieldName: string, value: any): void {
    const newValues = { ...this.state.values, [fieldName]: value }
    this.updateState({ values: newValues })

    // Auto-validate if field was previously touched
    if (this.state.touched[fieldName]) {
      this.validateField(fieldName)
    }
  }

  /**
   * Set field as touched
   */
  setTouched(fieldName: string): void {
    const newTouched = { ...this.state.touched, [fieldName]: true }
    this.updateState({ touched: newTouched })

    // Validate on touch
    this.validateField(fieldName)
  }

  /**
   * Validate single field
   */
  validateField(fieldName: string): boolean {
    const field = this.schema.fields.find(f => f.name === fieldName)
    if (!field) return true

    const value = this.state.values[fieldName]
    const validator = new FormFieldValidator(field.validation.rules, {
      min: field.validation.min,
      max: field.validation.max,
      minLength: field.validation.minLength,
      maxLength: field.validation.maxLength,
      pattern: field.validation.pattern,
    })

    const error = validator.validate(value)

    const newErrors = { ...this.state.errors }
    if (error) {
      newErrors[fieldName] = error
    } else {
      delete newErrors[fieldName]
    }

    const isValid = Object.keys(newErrors).length === 0

    this.updateState({
      errors: newErrors,
      isValid,
    })

    return !error
  }

  /**
   * Validate all fields
   */
  validateAll(): boolean {
    const errors: Record<string, string> = {}
    let isValid = true

    this.schema.fields.forEach(field => {
      const value = this.state.values[field.name]
      const validator = new FormFieldValidator(field.validation.rules, {
        min: field.validation.min,
        max: field.validation.max,
        minLength: field.validation.minLength,
        maxLength: field.validation.maxLength,
        pattern: field.validation.pattern,
      })

      const error = validator.validate(value)
      if (error) {
        errors[field.name] = error
        isValid = false
      }
    })

    this.updateState({
      errors,
      isValid,
      touched: this.schema.fields.reduce(
        (acc, field) => {
          acc[field.name] = true
          return acc
        },
        {} as Record<string, boolean>
      ),
    })

    return isValid
  }

  /**
   * Submit form
   */
  async submit(
    onSubmit: (values: Record<string, any>) => void | Promise<void>
  ): Promise<boolean> {
    this.updateState({ isSubmitting: true })

    try {
      const isValid = this.validateAll()

      if (isValid) {
        await onSubmit(this.state.values)
        return true
      }

      return false
    } finally {
      this.updateState({ isSubmitting: false })
    }
  }

  /**
   * Reset form
   */
  reset(initialValues: Record<string, any> = {}): void {
    this.updateState({
      values: this.getInitialValues(initialValues),
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false,
    })
  }

  /**
   * Get field props for easy integration
   */
  getFieldProps(fieldName: string) {
    return {
      name: fieldName,
      value: this.state.values[fieldName] || '',
      error: this.state.errors[fieldName],
      touched: this.state.touched[fieldName],
      onChange: (value: any) => this.setValue(fieldName, value),
      onBlur: () => this.setTouched(fieldName),
    }
  }
}

/**
 * Schema Builder for easier form creation
 */
export class FormSchemaBuilder {
  private fields: any[] = []
  private formId: string
  private formTitle?: string

  constructor(id: string, title?: string) {
    this.formId = id
    if (title) {
      this.formTitle = title
    }
  }

  /**
   * Add text field
   */
  text(
    name: string,
    label: string,
    options: {
      required?: boolean
      minLength?: number
      maxLength?: number
      placeholder?: string
      defaultValue?: string
    } = {}
  ) {
    const rules: ValidationRule[] = []
    if (options.required) rules.push('required')
    if (options.minLength || options.maxLength) {
      // Add length validation rules as needed
    }

    this.fields.push({
      name,
      type: 'text',
      label,
      placeholder: options.placeholder,
      defaultValue: options.defaultValue,
      validation: {
        rules,
        required: options.required,
        minLength: options.minLength,
        maxLength: options.maxLength,
      },
    })
    return this
  }

  /**
   * Add email field
   */
  email(
    name: string,
    label: string,
    options: {
      required?: boolean
      placeholder?: string
      defaultValue?: string
    } = {}
  ) {
    const rules: ValidationRule[] = ['email']
    if (options.required) rules.push('required')

    this.fields.push({
      name,
      type: 'email',
      label,
      placeholder: options.placeholder,
      defaultValue: options.defaultValue,
      validation: {
        rules,
        required: options.required,
      },
    })
    return this
  }

  /**
   * Add number field
   */
  number(
    name: string,
    label: string,
    options: {
      required?: boolean
      min?: number
      max?: number
      placeholder?: string
      defaultValue?: number
    } = {}
  ) {
    const rules: ValidationRule[] = ['number']
    if (options.required) rules.push('required')

    this.fields.push({
      name,
      type: 'number',
      label,
      placeholder: options.placeholder,
      defaultValue: options.defaultValue,
      validation: {
        rules,
        required: options.required,
        min: options.min,
        max: options.max,
      },
    })
    return this
  }

  /**
   * Build schema
   */
  build(): FormSchema {
    const schema: FormSchema = {
      id: this.formId,
      fields: this.fields,
      mode: 'onChange',
      shouldFocusError: true,
    }

    if (this.formTitle) {
      schema.title = this.formTitle
    }

    return schema
  }
}

/**
 * Create form validator
 */
export function createFormValidator(
  schema: FormSchema,
  initialValues?: Record<string, any>
): FormValidator {
  return new FormValidator(schema, initialValues)
}

/**
 * Create schema builder
 */
export function createFormSchema(
  id: string,
  title?: string
): FormSchemaBuilder {
  return new FormSchemaBuilder(id, title)
}

// Export validation utilities
export { ValidationUtils, validators } from './validators'
export * from './types'
