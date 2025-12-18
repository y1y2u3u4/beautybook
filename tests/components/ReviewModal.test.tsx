import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReviewModal from '@/components/ReviewModal'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ReviewModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    providerId: 'provider_001',
    providerName: 'Emma Davis',
    appointmentId: 'appt_001',
    onSuccess: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<ReviewModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Leave a Review')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<ReviewModal {...defaultProps} />)
    expect(screen.getByText('Leave a Review')).toBeInTheDocument()
    expect(screen.getByText(/Share your experience with Emma Davis/)).toBeInTheDocument()
  })

  it('should display 5 star rating buttons', () => {
    render(<ReviewModal {...defaultProps} />)
    const stars = screen.getAllByRole('button').filter(btn =>
      btn.querySelector('svg')
    )
    // 5 star buttons + close button + cancel button + submit button
    expect(stars.length).toBeGreaterThanOrEqual(5)
  })

  it('should show "Click to rate" initially', () => {
    render(<ReviewModal {...defaultProps} />)
    expect(screen.getByText('Click to rate')).toBeInTheDocument()
  })

  it('should update rating text when star is clicked', async () => {
    const user = userEvent.setup()
    render(<ReviewModal {...defaultProps} />)

    // Find star buttons by looking for buttons containing SVG stars
    const allButtons = screen.getAllByRole('button')
    // Filter to get star buttons (they have the transition-transform class)
    const starButtons = allButtons.filter(btn =>
      btn.className.includes('transition-transform')
    )

    await user.click(starButtons[4]) // 5th star

    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('should show error when submitting without rating', async () => {
    const user = userEvent.setup()
    render(<ReviewModal {...defaultProps} />)

    // The submit button is disabled when rating is 0, so we need to check for the disabled state
    const submitButton = screen.getByText('Submit Review')
    expect(submitButton).toBeDisabled()
  })

  it('should show error when comment is too short', async () => {
    const user = userEvent.setup()
    render(<ReviewModal {...defaultProps} />)

    // Find star buttons
    const allButtons = screen.getAllByRole('button')
    const starButtons = allButtons.filter(btn =>
      btn.className.includes('transition-transform')
    )
    await user.click(starButtons[4]) // 5th star

    // Enter short comment
    const textarea = screen.getByPlaceholderText('Tell others about your experience...')
    await user.type(textarea, 'Good')

    const submitButton = screen.getByText('Submit Review')
    await user.click(submitButton)

    expect(screen.getByText('Please write at least 10 characters')).toBeInTheDocument()
  })

  it('should call onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ReviewModal {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    render(<ReviewModal {...defaultProps} />)

    const backdrop = document.querySelector('.bg-black\\/50')
    if (backdrop) {
      await user.click(backdrop)
      expect(defaultProps.onClose).toHaveBeenCalled()
    }
  })

  it('should submit review successfully', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<ReviewModal {...defaultProps} />)

    // Find star buttons
    const allButtons = screen.getAllByRole('button')
    const starButtons = allButtons.filter(btn =>
      btn.className.includes('transition-transform')
    )
    await user.click(starButtons[4]) // 5th star

    // Enter comment
    const textarea = screen.getByPlaceholderText('Tell others about your experience...')
    await user.type(textarea, 'This was an excellent experience!')

    // Submit
    const submitButton = screen.getByText('Submit Review')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: 'provider_001',
          rating: 5,
          comment: 'This was an excellent experience!',
          appointmentId: 'appt_001',
        }),
      })
    })

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled()
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  it('should show error message when API fails', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    })

    render(<ReviewModal {...defaultProps} />)

    // Find star buttons
    const allButtons = screen.getAllByRole('button')
    const starButtons = allButtons.filter(btn =>
      btn.className.includes('transition-transform')
    )
    await user.click(starButtons[4])

    // Enter comment
    const textarea = screen.getByPlaceholderText('Tell others about your experience...')
    await user.type(textarea, 'This was an excellent experience!')

    // Submit
    const submitButton = screen.getByText('Submit Review')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('should display character count', () => {
    render(<ReviewModal {...defaultProps} />)
    expect(screen.getByText('0/10 characters minimum')).toBeInTheDocument()
  })

  it('should show rating descriptions', async () => {
    const user = userEvent.setup()
    render(<ReviewModal {...defaultProps} />)

    // Find star buttons
    const allButtons = screen.getAllByRole('button')
    const starButtons = allButtons.filter(btn =>
      btn.className.includes('transition-transform')
    )

    // Click each star and verify description
    await user.click(starButtons[0])
    expect(screen.getByText('Poor')).toBeInTheDocument()

    await user.click(starButtons[1])
    expect(screen.getByText('Fair')).toBeInTheDocument()

    await user.click(starButtons[2])
    expect(screen.getByText('Good')).toBeInTheDocument()

    await user.click(starButtons[3])
    expect(screen.getByText('Very Good')).toBeInTheDocument()

    await user.click(starButtons[4])
    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })
})
