import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { render, setupTest } from '../utils/test-utils'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  beforeEach(() => {
    setupTest()
  })

  describe('Basic Rendering', () => {
    it('should render correctly with default props', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('inline-flex items-center justify-center')
    })

    it('should render with custom className', () => {
      render(<Button className="custom-class">Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should render with data-testid', () => {
      render(<Button data-testid="test-button">Button</Button>)

      const button = screen.getByTestId('test-button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should render solid variant', () => {
      render(<Button variant="solid">Solid Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-500 text-white')
    })

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'bg-transparent text-primary-500 border-primary-500'
      )
    })

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent border-transparent')
    })

    it('should render link variant', () => {
      render(<Button variant="link">Link Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('underline-offset-4')
    })
  })

  describe('Color Schemes', () => {
    it('should render with primary color scheme', () => {
      render(<Button colorScheme="primary">Primary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-500')
    })

    it('should render with secondary color scheme', () => {
      render(<Button colorScheme="secondary">Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary-500')
    })

    it('should render with error color scheme', () => {
      render(<Button colorScheme="error">Error</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-error-500')
    })
  })

  describe('Sizes', () => {
    it('should render with xs size', () => {
      render(<Button size="xs">Extra Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-7 px-2.5 text-xs')
    })

    it('should render with sm size', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8 px-3 text-sm')
    })

    it('should render with md size (default)', () => {
      render(<Button size="md">Medium</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10 px-4 text-sm')
    })

    it('should render with lg size', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11 px-6 text-base')
    })

    it('should render with xl size', () => {
      render(<Button size="xl">Extra Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-12 px-8 text-lg')
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50')
    })

    it('should show loading state', () => {
      render(<Button loading>Loading Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('cursor-wait')

      // Check for loading spinner
      const spinner = button.querySelector('svg')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should hide content icons when loading', () => {
      render(
        <Button
          loading
          leftIcon={<span data-testid="left-icon">L</span>}
          rightIcon={<span data-testid="right-icon">R</span>}
        >
          Loading
        </Button>
      )

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('should render with left icon', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">←</span>}>
          With Left Icon
        </Button>
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('should render with right icon', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">→</span>}>
          With Right Icon
        </Button>
      )

      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should render with both icons', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Both Icons
        </Button>
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should handle click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Clickable</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when disabled', () => {
      const handleClick = jest.fn()
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not trigger click when loading', () => {
      const handleClick = jest.fn()
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should handle keyboard events', () => {
      const handleKeyDown = jest.fn()
      render(<Button onKeyDown={handleKeyDown}>Keyboard</Button>)

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })

      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper role', () => {
      render(<Button>Accessible Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>)

      const button = screen.getByRole('button', { name: /custom label/i })
      expect(button).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="description">Button</Button>
          <div id="description">Button description</div>
        </>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'description')
    })

    it('should have focus ring classes', () => {
      render(<Button>Focusable</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'focus-visible:outline-none focus-visible:ring-2'
      )
    })
  })

  describe('Compound Variants', () => {
    it('should combine variant and colorScheme correctly', () => {
      render(
        <Button variant="outline" colorScheme="error">
          Error Outline
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-error-500 border-error-500')
    })

    it('should handle ghost + secondary combination', () => {
      render(
        <Button variant="ghost" colorScheme="secondary">
          Secondary Ghost
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-secondary-500 hover:bg-secondary-50')
    })
  })

  describe('Forward Ref', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Ref Button</Button>)

      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.textContent).toBe('Ref Button')
    })
  })
})
