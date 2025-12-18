import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTestUser, TestUser } from '@/hooks/useTestUser'

// Create a real localStorage implementation for these tests
const createTestLocalStorage = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
}

describe('useTestUser', () => {
  const mockTestUser: TestUser = {
    id: 'test_001',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'CUSTOMER',
    imageUrl: 'https://example.com/image.jpg',
    isTestMode: true,
  }

  let testStorage: ReturnType<typeof createTestLocalStorage>

  beforeEach(() => {
    // Create fresh localStorage for each test
    testStorage = createTestLocalStorage()
    Object.defineProperty(window, 'localStorage', { value: testStorage, writable: true })
    vi.clearAllMocks()
  })

  afterEach(() => {
    testStorage.clear()
  })

  it('should initialize with no test user', async () => {
    const { result } = renderHook(() => useTestUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.testUser).toBeNull()
    expect(result.current.isTestMode).toBe(false)
  })

  it('should load test user from localStorage', async () => {
    localStorage.setItem('testMode', 'true')
    localStorage.setItem('testUser', JSON.stringify(mockTestUser))

    const { result } = renderHook(() => useTestUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.testUser).toEqual(mockTestUser)
    expect(result.current.isTestMode).toBe(true)
  })

  it('should handle invalid JSON in localStorage', async () => {
    localStorage.setItem('testMode', 'true')
    localStorage.setItem('testUser', 'invalid-json')

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useTestUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.testUser).toBeNull()
    expect(result.current.isTestMode).toBe(false)
    expect(localStorage.getItem('testUser')).toBeNull()
    expect(localStorage.getItem('testMode')).toBeNull()

    consoleSpy.mockRestore()
  })

  it('should not load user when testMode is false', async () => {
    localStorage.setItem('testMode', 'false')
    localStorage.setItem('testUser', JSON.stringify(mockTestUser))

    const { result } = renderHook(() => useTestUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.testUser).toBeNull()
    expect(result.current.isTestMode).toBe(false)
  })

  it('should login test user', async () => {
    const { result } = renderHook(() => useTestUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.loginTestUser(mockTestUser)
    })

    expect(result.current.testUser).toEqual(mockTestUser)
    expect(result.current.isTestMode).toBe(true)
    expect(localStorage.getItem('testMode')).toBe('true')
    expect(JSON.parse(localStorage.getItem('testUser') || '{}')).toEqual(mockTestUser)
  })

  it('should logout test user', async () => {
    localStorage.setItem('testMode', 'true')
    localStorage.setItem('testUser', JSON.stringify(mockTestUser))

    const { result } = renderHook(() => useTestUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isTestMode).toBe(true)

    act(() => {
      result.current.logoutTestUser()
    })

    expect(result.current.testUser).toBeNull()
    expect(result.current.isTestMode).toBe(false)
    expect(localStorage.getItem('testMode')).toBeNull()
    expect(localStorage.getItem('testUser')).toBeNull()
  })

  it('should handle provider role', async () => {
    const providerUser: TestUser = {
      ...mockTestUser,
      role: 'PROVIDER',
    }

    const { result } = renderHook(() => useTestUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.loginTestUser(providerUser)
    })

    expect(result.current.testUser?.role).toBe('PROVIDER')
  })

  it('should handle admin role', async () => {
    const adminUser: TestUser = {
      ...mockTestUser,
      role: 'ADMIN',
    }

    const { result } = renderHook(() => useTestUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.loginTestUser(adminUser)
    })

    expect(result.current.testUser?.role).toBe('ADMIN')
  })
})
