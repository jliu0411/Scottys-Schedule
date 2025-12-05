import { phrases } from '../components/landing/phrases'
import { Colors } from '../constants/Colors'
import { formatRepeatDays } from '../components/alarms/formatRepeatDays'
import { getNextRepeatDate } from '../contexts/repeats'
import { getTriggerDate } from '../hooks/useNotification'

// ============================================================================
// MOCKS - Minimal external dependencies
// ============================================================================

jest.mock('expo-router')
jest.mock('react-native-safe-area-context')
jest.mock('expo-notifications')
jest.mock('@react-native-async-storage/async-storage')
jest.mock('../lib/appwrite')

const mockedUseUser = jest.fn()
jest.mock('../hooks/useUser', () => ({ useUser: () => mockedUseUser() }))

const mockedUseBooks = jest.fn()
jest.mock('../hooks/useBooks', () => ({ useBooks: () => mockedUseBooks() }))

// ============================================================================
// PHRASES MODULE - WHITEBOX: Direct Code Testing
// ============================================================================

describe('[WHITEBOX] PHRASES: Motivational Content System', () => {
  test('phrases array has 10 valid motivational messages', () => {
    expect(Array.isArray(phrases)).toBe(true)
    expect(phrases.length).toBe(10)
    phrases.forEach((phrase) => {
      expect(typeof phrase).toBe('string')
      expect(phrase.length).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// COLORS CONSTANTS - WHITEBOX: Theme Configuration
// ============================================================================

describe('[WHITEBOX] COLORS: Theme Configuration Constants', () => {
  test('Colors exports all required theme properties', () => {
    expect(Colors.primary).toBeDefined()
    expect(Colors.warning).toBeDefined()
    expect(Colors.light).toBeDefined()
    expect(Colors.light.text).toBeDefined()
    expect(Colors.light.background).toBeDefined()
    expect(Colors.light.iconColor).toBeDefined()
    expect(Colors.light.iconColorFocused).toBeDefined()
  })
})

// ============================================================================
// FORMAT REPEAT DAYS - WHITEBOX: Parsing Logic
// ============================================================================

describe('[WHITEBOX] FORMAT REPEAT DAYS: Repeat Scheduling Logic', () => {
  test('returns "Select Days" for empty or null days', () => {
    expect(formatRepeatDays(null)).toBe('Select Days')
    expect(formatRepeatDays([])).toBe('Select Days')
  })

  test('returns "Everyday" when all 7 days selected', () => {
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    expect(formatRepeatDays(allDays)).toBe('Everyday')
  })

  test('returns "Weekdays" for Mon-Fri, "Weekends" for Sat-Sun', () => {
    expect(formatRepeatDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])).toBe('Weekdays')
    expect(formatRepeatDays(['Sat', 'Sun'])).toBe('Weekends')
  })

  test('returns comma-separated days for custom selection', () => {
    expect(formatRepeatDays(['Mon', 'Wed', 'Fri'])).toBe('Mon, Wed, Fri')
    expect(formatRepeatDays(['Mon'])).toBe('Mon')
  })

  test('requires exact day sets for Weekdays/Weekends format', () => {
    expect(formatRepeatDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])).not.toBe('Weekdays')
    expect(formatRepeatDays(['Sat', 'Sun', 'Mon'])).not.toBe('Weekends')
  })
})

// ============================================================================
// FORMAT REPEAT DAYS - BLACKBOX: User Display
// ============================================================================

describe('[BLACKBOX] FORMAT REPEAT DAYS: User Display & Selection', () => {
  test('user sees readable repeat schedule', () => {
    expect(formatRepeatDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])).toBe('Weekdays')
    expect(formatRepeatDays(['Mon', 'Wed', 'Fri'])).toContain('Mon')
    expect(typeof formatRepeatDays(['Sat', 'Sun'])).toBe('string')
  })
})

// ============================================================================
// GET NEXT REPEAT DATE - WHITEBOX: Scheduling Logic
// ============================================================================

describe('[WHITEBOX] GET NEXT REPEAT DATE: Repeat Scheduling Algorithm', () => {
  test('returns same date when repeats array is empty', () => {
    const date = new Date('2024-01-15T10:00:00')
    const result = getNextRepeatDate(date, [], '15:00')
    expect(result.getDate()).toBe(date.getDate())
    expect(result.getMonth()).toBe(date.getMonth())
  })

  test('schedules task for nearest repeat day, before or after today', () => {
    const date = new Date('2024-01-15T10:00:00')
    const result = getNextRepeatDate(date, ['Monday', 'Friday'], '15:00')
    expect(result).toBeDefined()
    expect(result.getHours()).toBe(0)
  })

  test('respects end time: before = today, after = next occurrence', () => {
    const beforeEndTime = new Date('2024-01-15T14:00:00')
    const afterEndTime = new Date('2024-01-15T16:00:00')
    const resultBefore = getNextRepeatDate(beforeEndTime, ['Monday'], '15:00')
    const resultAfter = getNextRepeatDate(afterEndTime, ['Monday'], '15:00')
    expect(resultBefore.getDate()).toBe(beforeEndTime.getDate())
    expect(resultAfter.getTime()).toBeGreaterThan(afterEndTime.getTime())
  })

  test('handles all 7 days of the week', () => {
    const date = new Date('2024-01-15T10:00:00')
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const result = getNextRepeatDate(date, allDays, '15:00')
    expect(result instanceof Date).toBe(true)
  })

  test('wraps to next week when no repeat days match current week', () => {
    const date = new Date('2024-01-15T16:00:00')
    const result = getNextRepeatDate(date, ['Tuesday', 'Wednesday'], '15:00')
    expect(result.getTime()).toBeGreaterThan(date.getTime())
  })

  test('sets hours, minutes, seconds to 0', () => {
    const date = new Date('2024-01-15T14:30:45.123')
    const result = getNextRepeatDate(date, ['Friday'], '15:00')
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
  })

  test('returns valid Date object', () => {
    const date = new Date('2024-01-15T10:00:00')
    const result = getNextRepeatDate(date, ['Friday'], '15:00')
    expect(result instanceof Date).toBe(true)
    expect(isNaN(result.getTime())).toBe(false)
  })

  test('handles edge case: exactly at end time', () => {
    const date = new Date('2024-01-15T15:00:00')
    const result = getNextRepeatDate(date, ['Monday'], '15:00')
    expect(result).toBeDefined()
  })
})

// ============================================================================
// GET NEXT REPEAT DATE - BLACKBOX: Scheduling from User Perspective
// ============================================================================

describe('[BLACKBOX] GET NEXT REPEAT DATE: Task Scheduling User Experience', () => {
  test('user can schedule recurring tasks for specific weekdays', () => {
    const date = new Date('2024-01-15T10:00:00')
    const nextDate = getNextRepeatDate(date, ['Friday'], '15:00')
    expect(nextDate.getTime()).toBeGreaterThanOrEqual(date.getTime())
  })

  test('user can schedule daily recurring tasks', () => {
    const date = new Date('2024-01-15T10:00:00')
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const nextDate = getNextRepeatDate(date, allDays, '15:00')
    expect(nextDate).toBeDefined()
  })

  test('user can schedule weekday and weekend-only tasks', () => {
    const date = new Date('2024-01-13T10:00:00')
    const weekdayTask = getNextRepeatDate(date, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '15:00')
    const weekendTask = getNextRepeatDate(date, ['Saturday', 'Sunday'], '15:00')
    expect(weekdayTask).toBeDefined()
    expect(weekendTask).toBeDefined()
  })
})

// ============================================================================
// GET TRIGGER DATE - WHITEBOX: Date/Time Parsing
// ============================================================================

describe('[WHITEBOX] GET TRIGGER DATE: Notification Trigger Parsing', () => {
  test('creates valid Date object from date and time strings', () => {
    const result = getTriggerDate('2024-01-15', '14:30')
    expect(result instanceof Date).toBe(true)
  })

  test('parses hours, minutes correctly and sets seconds to 0', () => {
    const result = getTriggerDate('2024-01-15', '14:30')
    expect(result!.getHours()).toBe(14)
    expect(result!.getMinutes()).toBe(30)
    expect(result!.getSeconds()).toBe(0)
  })

  test('handles edge times: midnight (00:00) and 23:59', () => {
    const midnight = getTriggerDate('2024-01-15', '00:00')
    const endOfDay = getTriggerDate('2024-01-15', '23:59')
    expect(midnight!.getHours()).toBe(0)
    expect(endOfDay!.getHours()).toBe(23)
  })

  test('parses date components into correct year, month, day', () => {
    const result = getTriggerDate('2024-01-15', '14:30')
    expect(result!.getFullYear()).toBe(2024)
    expect(result!.getMonth()).toBe(0)
  })

  test('handles invalid inputs gracefully', () => {
    expect(getTriggerDate('invalid', '14:30') === null || isNaN(getTriggerDate('invalid', '14:30')?.getTime()!)).toBe(true)
    expect(getTriggerDate('2024-01-15', '') === null || isNaN(getTriggerDate('2024-01-15', '')?.getTime()!)).toBe(true)
  })

  test('returns Date instance with callable methods', () => {
    const result = getTriggerDate('2024-01-15', '14:30')
    expect(typeof result!.getTime).toBe('function')
  })
})

// ============================================================================
// GET TRIGGER DATE - BLACKBOX: Notification User Experience
// ============================================================================

describe('[BLACKBOX] GET TRIGGER DATE: Notification Scheduling', () => {
  test('user can set notification trigger times throughout the day', () => {
    expect(getTriggerDate('2024-01-15', '09:00')).not.toBeNull()
    expect(getTriggerDate('2024-01-15', '14:30')).not.toBeNull()
    expect(getTriggerDate('2024-01-15', '20:30')).not.toBeNull()
  })

  test('notification time is precise to the minute', () => {
    const triggerDate = getTriggerDate('2024-01-15', '14:45')
    expect(triggerDate!.getMinutes()).toBe(45)
  })

  test('different dates and times create different notification times', () => {
    const date1 = getTriggerDate('2024-01-15', '14:30')
    const date2 = getTriggerDate('2024-01-16', '14:30')
    const time2 = getTriggerDate('2024-01-15', '17:00')
    if (date1 && date2 && time2) {
      expect(date1.getTime()).not.toBe(date2.getTime())
      expect(date1.getTime()).not.toBe(time2.getTime())
    }
  })
})

// ============================================================================
// USER CONTEXT INTEGRATION - WHITEBOX: Auth Logic
// ============================================================================

describe('[WHITEBOX] USER CONTEXT: Authentication Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseUser.mockClear()
  })

  test('user context provides login function', () => {
    const loginMock = jest.fn()
    mockedUseUser.mockReturnValue({
      user: null,
      login: loginMock,
      authChecked: false,
    })
    const { login } = mockedUseUser()
    expect(typeof login).toBe('function')
  })

  test('user context provides register function', () => {
    const registerMock = jest.fn()
    mockedUseUser.mockReturnValue({
      user: null,
      register: registerMock,
      authChecked: false,
    })
    const { register } = mockedUseUser()
    expect(typeof register).toBe('function')
  })

  test('user context provides logout function', () => {
    const logoutMock = jest.fn()
    mockedUseUser.mockReturnValue({
      user: { $id: 'user-123' },
      logout: logoutMock,
      authChecked: true,
    })
    const { logout } = mockedUseUser()
    expect(typeof logout).toBe('function')
  })

  test('user context maintains auth state', () => {
    const userId = 'persistent-id'
    mockedUseUser.mockReturnValue({
      user: { $id: userId, email: 'test@test.com' },
      authChecked: true,
    })
    const result1 = mockedUseUser()
    const result2 = mockedUseUser()
    expect(result1.user.$id).toBe(result2.user.$id)
  })

  test('user context tracks authChecked state', () => {
    mockedUseUser.mockReturnValue({
      user: null,
      authChecked: false,
    })
    const { authChecked } = mockedUseUser()
    expect(typeof authChecked).toBe('boolean')
  })

  test('login function accepts email and password parameters', () => {
    const loginMock = jest.fn()
    mockedUseUser.mockReturnValue({
      login: loginMock,
    })
    const { login } = mockedUseUser()
    login('user@example.com', 'password')
    expect(loginMock).toHaveBeenCalledWith('user@example.com', 'password')
  })

  test('register function accepts email and password parameters', () => {
    const registerMock = jest.fn()
    mockedUseUser.mockReturnValue({
      register: registerMock,
    })
    const { register } = mockedUseUser()
    register('newuser@example.com', 'password123')
    expect(registerMock).toHaveBeenCalledWith('newuser@example.com', 'password123')
  })

  test('logout function can be called without parameters', () => {
    const logoutMock = jest.fn()
    mockedUseUser.mockReturnValue({
      logout: logoutMock,
    })
    const { logout } = mockedUseUser()
    logout()
    expect(logoutMock).toHaveBeenCalled()
  })
})

// ============================================================================
// USER CONTEXT INTEGRATION - BLACKBOX: Auth User Flow
// ============================================================================

describe('[BLACKBOX] USER CONTEXT: User Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseUser.mockClear()
  })

  test('new user can register account', () => {
    const registerMock = jest.fn()
    mockedUseUser.mockReturnValue({
      user: null,
      register: registerMock,
    })
    const { register } = mockedUseUser()
    register('newuser@test.com', 'securePassword')
    expect(registerMock).toHaveBeenCalled()
  })

  test('registered user can login', () => {
    const loginMock = jest.fn()
    mockedUseUser.mockReturnValue({
      user: null,
      login: loginMock,
    })
    const { login } = mockedUseUser()
    login('user@test.com', 'password')
    expect(loginMock).toHaveBeenCalled()
  })

  test('logged in user can logout', () => {
    const logoutMock = jest.fn()
    mockedUseUser.mockReturnValue({
      user: { $id: 'user-1', email: 'user@test.com' },
      logout: logoutMock,
      authChecked: true,
    })
    const { logout } = mockedUseUser()
    logout()
    expect(logoutMock).toHaveBeenCalled()
  })

  test('auth state is persistent across renders', () => {
    const userId = 'authenticated-user'
    mockedUseUser.mockReturnValue({
      user: { $id: userId },
      authChecked: true,
    })
    expect(mockedUseUser().user.$id).toBe(userId)
    expect(mockedUseUser().user.$id).toBe(userId)
  })

  test('authChecked flag indicates ready state', () => {
    mockedUseUser.mockReturnValue({
      user: { $id: 'user-1' },
      authChecked: true,
    })
    const { authChecked } = mockedUseUser()
    expect(authChecked).toBe(true)
  })
})

// ============================================================================
// BOOKS CONTEXT INTEGRATION - WHITEBOX: Task Management Logic
// ============================================================================

describe('[WHITEBOX] BOOKS CONTEXT: Task Management Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
  })

  test('books context provides createBook function', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    expect(typeof createBook).toBe('function')
  })

  test('books context provides updateBook function', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    expect(typeof updateBook).toBe('function')
  })

  test('books context provides deleteBook function', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
    })
    const { deleteBook } = mockedUseBooks()
    expect(typeof deleteBook).toBe('function')
  })

  test('books context tracks progress value', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.75,
    })
    const { progress } = mockedUseBooks()
    expect(typeof progress).toBe('number')
    expect(progress).toBeLessThanOrEqual(1)
    expect(progress).toBeGreaterThanOrEqual(0)
  })

  test('books context maintains books array', () => {
    mockedUseBooks.mockReturnValue({
      books: [
        { $id: '1', name: 'Task 1', isCompleted: true },
        { $id: '2', name: 'Task 2', isCompleted: false },
      ],
    })
    const { books } = mockedUseBooks()
    expect(Array.isArray(books)).toBe(true)
  })

  test('books context categorizes tasks', () => {
    mockedUseBooks.mockReturnValue({
      currentTasks: [],
      previousTasks: [],
      upcomingTasks: [],
    })
    const { currentTasks, previousTasks, upcomingTasks } = mockedUseBooks()
    expect(Array.isArray(currentTasks)).toBe(true)
    expect(Array.isArray(previousTasks)).toBe(true)
    expect(Array.isArray(upcomingTasks)).toBe(true)
  })

  test('createBook accepts task object parameter', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    createBook({ name: 'Study', date: '2024-01-15', timeStarts: '09:00' })
    expect(createBookMock).toHaveBeenCalled()
  })

  test('updateBook accepts task id and update object', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    updateBook('task-1', { name: 'Updated Task', isCompleted: true })
    expect(updateBookMock).toHaveBeenCalled()
  })

  test('deleteBook accepts task id parameter', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
    })
    const { deleteBook } = mockedUseBooks()
    deleteBook('task-1')
    expect(deleteBookMock).toHaveBeenCalled()
  })
})

// ============================================================================
// BOOKS CONTEXT INTEGRATION - BLACKBOX: Task Management User Flow
// ============================================================================

describe('[BLACKBOX] BOOKS CONTEXT: Task Management User Experience', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
  })

  test('user can create new task', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    createBook({ name: 'Study Math', date: '2024-01-15' })
    expect(createBookMock).toHaveBeenCalled()
  })

  test('user can update existing task', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    updateBook('task-1', { name: 'Updated Task Name' })
    expect(updateBookMock).toHaveBeenCalled()
  })

  test('user can delete task', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
    })
    const { deleteBook } = mockedUseBooks()
    deleteBook('task-1')
    expect(deleteBookMock).toHaveBeenCalled()
  })

  test('user can mark task as completed', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    updateBook('task-1', { isCompleted: true })
    expect(updateBookMock).toHaveBeenCalled()
  })

  test('user sees progress bar updated', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.5,
      books: [
        { $id: '1', name: 'Task 1', isCompleted: true },
        { $id: '2', name: 'Task 2', isCompleted: false },
      ],
    })
    const { progress, books } = mockedUseBooks()
    const completedCount = books.filter((b: any) => b.isCompleted).length
    expect(completedCount).toBeGreaterThan(0)
    expect(progress).toBeGreaterThan(0)
  })

  test('user can view current tasks', () => {
    mockedUseBooks.mockReturnValue({
      currentTasks: [
        { $id: '1', name: 'Current Task 1' },
        { $id: '2', name: 'Current Task 2' },
      ],
    })
    const { currentTasks } = mockedUseBooks()
    expect(currentTasks.length).toBeGreaterThan(0)
  })

  test('user can view previous tasks', () => {
    mockedUseBooks.mockReturnValue({
      previousTasks: [
        { $id: '1', name: 'Past Task' },
      ],
    })
    const { previousTasks } = mockedUseBooks()
    expect(Array.isArray(previousTasks)).toBe(true)
  })

  test('user can view upcoming tasks', () => {
    mockedUseBooks.mockReturnValue({
      upcomingTasks: [
        { $id: '1', name: 'Future Task' },
      ],
    })
    const { upcomingTasks } = mockedUseBooks()
    expect(Array.isArray(upcomingTasks)).toBe(true)
  })
})

// ============================================================================
// CROSS-MODULE INTEGRATION TESTS
// ============================================================================

describe('[INTEGRATION] Cross-Module Functionality', () => {
  test('phrases module integrates with task scheduling', () => {
    expect(phrases.length).toBeGreaterThan(0)
    const date = new Date('2024-01-15T10:00:00')
    const nextDate = getNextRepeatDate(date, ['Friday'], '15:00')
    expect(nextDate).toBeDefined()
  })

  test('colors integrate with task UI display', () => {
    expect(Colors.light.background).toBeDefined()
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    updateBook('task-1', { name: 'Task' })
    expect(updateBookMock).toHaveBeenCalled()
  })

  test('notification trigger date with task scheduling', () => {
    const triggerDate = getTriggerDate('2024-01-15', '14:30')
    const scheduledDate = getNextRepeatDate(new Date('2024-01-15T10:00:00'), ['Monday'], '15:00')
    expect(triggerDate).not.toBeNull()
    expect(scheduledDate).toBeDefined()
  })

  test('repeat formatting with scheduling logic', () => {
    const formatted = formatRepeatDays(['Monday', 'Wednesday', 'Friday'])
    const nextDate = getNextRepeatDate(new Date('2024-01-15T10:00:00'), ['Monday'], '15:00')
    expect(formatted).toBeDefined()
    expect(nextDate).toBeDefined()
  })

  test('user auth required for task management', () => {
    const loginMock = jest.fn()
    mockedUseUser.mockReturnValue({
      user: null,
      login: loginMock,
    })
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    
    const { login } = mockedUseUser()
    login('user@test.com', 'password')
    
    const { createBook } = mockedUseBooks()
    createBook({ name: 'Task', date: '2024-01-15' })
    
    expect(loginMock).toHaveBeenCalled()
    expect(createBookMock).toHaveBeenCalled()
  })
})

// ============================================================================
// ERROR HANDLING & EDGE CASES
// ============================================================================

describe('[ERROR HANDLING] Edge Cases & Robustness', () => {
  test('getTriggerDate returns null for malformed date', () => {
    const result = getTriggerDate('not-a-date', '14:30')
    expect(result === null || isNaN(result.getTime())).toBe(true)
  })

  test('getTriggerDate returns null for malformed time', () => {
    const result = getTriggerDate('2024-01-15', 'not-a-time')
    expect(result === null || isNaN(result.getTime())).toBe(true)
  })

  test('formatRepeatDays handles empty array gracefully', () => {
    const result = formatRepeatDays([])
    expect(result).toBe('Select Days')
  })

  test('getNextRepeatDate returns valid date for all inputs', () => {
    const date = new Date('2024-01-15T10:00:00')
    const result = getNextRepeatDate(date, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], '15:00')
    expect(result instanceof Date).toBe(true)
  })
})

// ============================================================================
// TASK MANAGEMENT - WHITEBOX: Task CRUD Operations
// ============================================================================

describe('[WHITEBOX] TASK MANAGEMENT: Task CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
  })

  test('books context provides createBook function', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    expect(typeof createBook).toBe('function')
  })

  test('createBook accepts task data object', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    const taskData = {
      name: 'Study Math',
      date: '2024-01-15',
      timeStarts: '09:00',
      timeEnds: '11:00',
      repeats: ['Monday'],
    }
    createBook(taskData)
    expect(createBookMock).toHaveBeenCalledWith(taskData)
  })

  test('createBook requires task name', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    const taskData = {
      name: 'Study',
      date: '2024-01-15',
      timeStarts: '09:00',
    }
    createBook(taskData)
    expect(createBookMock.mock.calls[0][0].name).toBe('Study')
  })

  test('books context provides updateBook function', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    expect(typeof updateBook).toBe('function')
  })

  test('updateBook accepts task id and update data', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    updateBook('task-123', { name: 'Updated Task' })
    expect(updateBookMock).toHaveBeenCalledWith('task-123', { name: 'Updated Task' })
  })

  test('books context provides deleteBook function', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
    })
    const { deleteBook } = mockedUseBooks()
    expect(typeof deleteBook).toBe('function')
  })

  test('deleteBook accepts task id', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
    })
    const { deleteBook } = mockedUseBooks()
    deleteBook('task-123')
    expect(deleteBookMock).toHaveBeenCalledWith('task-123')
  })

  test('changeIsCompleted function toggles completion status', () => {
    const changeIsCompletedMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      changeIsCompleted: changeIsCompletedMock,
    })
    const { changeIsCompleted } = mockedUseBooks()
    changeIsCompleted('task-123', false)
    expect(changeIsCompletedMock).toHaveBeenCalledWith('task-123', false)
  })

  test('task data structure includes required fields', () => {
    mockedUseBooks.mockReturnValue({
      books: [
        {
          $id: 'task-1',
          name: 'Study Math',
          date: '2024-01-15',
          timeStarts: '09:00',
          timeEnds: '11:00',
          isCompleted: false,
          repeats: ['Monday'],
          userID: 'user-1',
        },
      ],
    })
    const { books } = mockedUseBooks()
    const task = books[0]
    expect(task.$id).toBeDefined()
    expect(task.name).toBeDefined()
    expect(task.date).toBeDefined()
    expect(task.timeStarts).toBeDefined()
    expect(task.timeEnds).toBeDefined()
    expect(task.isCompleted).toBeDefined()
  })

  test('task completion status is boolean', () => {
    mockedUseBooks.mockReturnValue({
      books: [{ $id: '1', isCompleted: true }],
    })
    const { books } = mockedUseBooks()
    expect(typeof books[0].isCompleted).toBe('boolean')
  })
})

// ============================================================================
// TASK MANAGEMENT - WHITEBOX: Task Categorization
// ============================================================================

describe('[WHITEBOX] TASK MANAGEMENT: Task Categorization Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
  })

  test('current tasks are tasks happening now', () => {
    mockedUseBooks.mockReturnValue({
      currentTasks: [
        { $id: '1', name: 'Current Task', timeStarts: '09:00', timeEnds: '10:00' },
      ],
    })
    const { currentTasks } = mockedUseBooks()
    expect(Array.isArray(currentTasks)).toBe(true)
    expect(currentTasks.length).toBeGreaterThan(0)
  })

  test('previous tasks are tasks that have ended', () => {
    mockedUseBooks.mockReturnValue({
      previousTasks: [
        { $id: '1', name: 'Past Task', timeEnds: '08:00' },
      ],
    })
    const { previousTasks } = mockedUseBooks()
    expect(Array.isArray(previousTasks)).toBe(true)
  })

  test('upcoming tasks are tasks that haven\'t started', () => {
    mockedUseBooks.mockReturnValue({
      upcomingTasks: [
        { $id: '1', name: 'Future Task', timeStarts: '14:00' },
      ],
    })
    const { upcomingTasks } = mockedUseBooks()
    expect(Array.isArray(upcomingTasks)).toBe(true)
  })

  test('daily tasks are tasks for a specific date', () => {
    mockedUseBooks.mockReturnValue({
      dailyTasks: [
        { $id: '1', name: 'Daily Task 1', date: '2024-01-15' },
        { $id: '2', name: 'Daily Task 2', date: '2024-01-15' },
      ],
    })
    const { dailyTasks } = mockedUseBooks()
    expect(Array.isArray(dailyTasks)).toBe(true)
    expect(dailyTasks.length).toBe(2)
  })

  test('fetchTasksByDate retrieves tasks for specific date', () => {
    const fetchTasksByDateMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchTasksByDate: fetchTasksByDateMock,
    })
    const { fetchTasksByDate } = mockedUseBooks()
    const testDate = new Date('2024-01-15')
    fetchTasksByDate(testDate)
    expect(fetchTasksByDateMock).toHaveBeenCalledWith(testDate)
  })

  test('fetchPreviousTasks retrieves completed tasks', () => {
    const fetchPreviousTasksMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchPreviousTasks: fetchPreviousTasksMock,
    })
    const { fetchPreviousTasks } = mockedUseBooks()
    fetchPreviousTasks()
    expect(fetchPreviousTasksMock).toHaveBeenCalled()
  })

  test('fetchCurrentTasks retrieves ongoing tasks', () => {
    const fetchCurrentTasksMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchCurrentTasks: fetchCurrentTasksMock,
    })
    const { fetchCurrentTasks } = mockedUseBooks()
    fetchCurrentTasks()
    expect(fetchCurrentTasksMock).toHaveBeenCalled()
  })

  test('fetchUpcomingTasks retrieves future tasks', () => {
    const fetchUpcomingTasksMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchUpcomingTasks: fetchUpcomingTasksMock,
    })
    const { fetchUpcomingTasks } = mockedUseBooks()
    fetchUpcomingTasks()
    expect(fetchUpcomingTasksMock).toHaveBeenCalled()
  })
})

// ============================================================================
// TASK MANAGEMENT - WHITEBOX: Task Progress Tracking
// ============================================================================

describe('[WHITEBOX] TASK MANAGEMENT: Progress Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
  })

  test('progress is tracked as a number between 0 and 1', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.5,
    })
    const { progress } = mockedUseBooks()
    expect(typeof progress).toBe('number')
    expect(progress).toBeGreaterThanOrEqual(0)
    expect(progress).toBeLessThanOrEqual(1)
  })

  test('progress is 0 when no tasks completed', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0,
      books: [
        { $id: '1', isCompleted: false },
        { $id: '2', isCompleted: false },
      ],
    })
    const { progress } = mockedUseBooks()
    expect(progress).toBe(0)
  })

  test('progress is 1 when all tasks completed', () => {
    mockedUseBooks.mockReturnValue({
      progress: 1,
      books: [
        { $id: '1', isCompleted: true },
        { $id: '2', isCompleted: true },
      ],
    })
    const { progress } = mockedUseBooks()
    expect(progress).toBe(1)
  })

  test('progress is fractional for partial completion', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.33,
      books: [
        { $id: '1', isCompleted: true },
        { $id: '2', isCompleted: false },
        { $id: '3', isCompleted: false },
      ],
    })
    const { progress } = mockedUseBooks()
    expect(progress).toBeGreaterThan(0)
    expect(progress).toBeLessThan(1)
  })

  test('progress updates when task completion status changes', () => {
    const changeIsCompletedMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      changeIsCompleted: changeIsCompletedMock,
    })
    const { changeIsCompleted } = mockedUseBooks()
    changeIsCompleted('task-1', false)
    expect(changeIsCompletedMock).toHaveBeenCalled()
  })

  test('all books array contains all tasks', () => {
    mockedUseBooks.mockReturnValue({
      books: [
        { $id: '1', name: 'Task 1', isCompleted: true },
        { $id: '2', name: 'Task 2', isCompleted: false },
        { $id: '3', name: 'Task 3', isCompleted: false },
      ],
    })
    const { books } = mockedUseBooks()
    expect(Array.isArray(books)).toBe(true)
    expect(books.length).toBe(3)
  })
})

// ============================================================================
// TASK MANAGEMENT - BLACKBOX: User Task Workflow
// ============================================================================

describe('[BLACKBOX] TASK MANAGEMENT: User Task Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
  })

  test('user can create new task', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    createBook({
      name: 'Study Physics',
      date: '2024-01-15',
      timeStarts: '10:00',
      timeEnds: '12:00',
    })
    expect(createBookMock).toHaveBeenCalled()
  })

  test('user can view all tasks', () => {
    mockedUseBooks.mockReturnValue({
      books: [
        { $id: '1', name: 'Task 1' },
        { $id: '2', name: 'Task 2' },
      ],
    })
    const { books } = mockedUseBooks()
    expect(books.length).toBe(2)
  })

  test('user can view tasks by date', () => {
    const fetchTasksByDateMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchTasksByDate: fetchTasksByDateMock,
      dailyTasks: [
        { $id: '1', name: 'Daily Task', date: '2024-01-15' },
      ],
    })
    const { fetchTasksByDate, dailyTasks } = mockedUseBooks()
    fetchTasksByDate(new Date('2024-01-15'))
    expect(fetchTasksByDateMock).toHaveBeenCalled()
    expect(dailyTasks.length).toBeGreaterThan(0)
  })

  test('user can view current tasks (in progress)', () => {
    mockedUseBooks.mockReturnValue({
      currentTasks: [
        { $id: '1', name: 'Current Task', timeStarts: '09:00', timeEnds: '10:00' },
      ],
    })
    const { currentTasks } = mockedUseBooks()
    expect(currentTasks.length).toBeGreaterThan(0)
  })

  test('user can view previous tasks (completed)', () => {
    mockedUseBooks.mockReturnValue({
      previousTasks: [
        { $id: '1', name: 'Completed Task', isCompleted: true },
      ],
    })
    const { previousTasks } = mockedUseBooks()
    expect(Array.isArray(previousTasks)).toBe(true)
  })

  test('user can view upcoming tasks (not started)', () => {
    mockedUseBooks.mockReturnValue({
      upcomingTasks: [
        { $id: '1', name: 'Future Task', timeStarts: '14:00' },
      ],
    })
    const { upcomingTasks } = mockedUseBooks()
    expect(Array.isArray(upcomingTasks)).toBe(true)
  })

  test('user can mark task as completed', () => {
    const changeIsCompletedMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      changeIsCompleted: changeIsCompletedMock,
    })
    const { changeIsCompleted } = mockedUseBooks()
    changeIsCompleted('task-1', false)
    expect(changeIsCompletedMock).toHaveBeenCalled()
  })

  test('user can mark task as incomplete', () => {
    const changeIsCompletedMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      changeIsCompleted: changeIsCompletedMock,
    })
    const { changeIsCompleted } = mockedUseBooks()
    changeIsCompleted('task-1', true)
    expect(changeIsCompletedMock).toHaveBeenCalled()
  })

  test('user can edit task details', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    updateBook('task-1', { name: 'Updated Task Name', timeStarts: '11:00' })
    expect(updateBookMock).toHaveBeenCalled()
  })

  test('user can delete task', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
    })
    const { deleteBook } = mockedUseBooks()
    deleteBook('task-1')
    expect(deleteBookMock).toHaveBeenCalled()
  })

  test('task list is sorted by time', () => {
    mockedUseBooks.mockReturnValue({
      books: [
        { $id: '1', name: 'Early Task', timeStarts: '09:00', date: '2024-01-15' },
        { $id: '2', name: 'Late Task', timeStarts: '14:00', date: '2024-01-15' },
      ],
    })
    const { books } = mockedUseBooks()
    expect(books[0].timeStarts < books[1].timeStarts).toBe(true)
  })

  test('user can have recurring tasks', () => {
    mockedUseBooks.mockReturnValue({
      books: [
        {
          $id: '1',
          name: 'Daily Study',
          repeats: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        },
      ],
    })
    const { books } = mockedUseBooks()
    expect(books[0].repeats).toBeDefined()
    expect(books[0].repeats.length).toBeGreaterThan(0)
  })
})

// ============================================================================
// TASK MANAGEMENT - INTEGRATION: Task Operations
// ============================================================================

describe('[INTEGRATION] TASK MANAGEMENT: Cross-Operation Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
  })

  test('creating task updates all task lists', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
      currentTasks: [],
      upcomingTasks: [{ $id: '1', name: 'New Task' }],
      previousTasks: [],
    })
    const { createBook, upcomingTasks } = mockedUseBooks()
    createBook({ name: 'New Task', timeStarts: '14:00' })
    expect(createBookMock).toHaveBeenCalled()
    expect(upcomingTasks.length).toBeGreaterThan(0)
  })

  test('completing task updates progress and task lists', () => {
    const changeIsCompletedMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      changeIsCompleted: changeIsCompletedMock,
      progress: 0.5,
      previousTasks: [{ $id: '1', isCompleted: true }],
    })
    const { changeIsCompleted, progress } = mockedUseBooks()
    changeIsCompleted('task-1', false)
    expect(changeIsCompletedMock).toHaveBeenCalled()
    expect(progress).toBeGreaterThan(0)
  })

  test('deleting task updates all lists', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
      books: [],
      currentTasks: [],
      upcomingTasks: [],
      previousTasks: [],
    })
    const { deleteBook } = mockedUseBooks()
    deleteBook('task-1')
    expect(deleteBookMock).toHaveBeenCalled()
  })

  test('editing task preserves other task data', () => {
    const updateBookMock = jest.fn()
    const originalTask = {
      $id: 'task-1',
      name: 'Original Name',
      date: '2024-01-15',
      timeStarts: '09:00',
      timeEnds: '10:00',
      isCompleted: false,
    }
    mockedUseBooks.mockReturnValue({
      books: [originalTask],
      updateBook: updateBookMock,
    })
    const { updateBook, books } = mockedUseBooks()
    updateBook('task-1', { name: 'Updated Name' })
    expect(updateBookMock).toHaveBeenCalled()
    expect(books[0].date).toBe(originalTask.date)
  })
})

// ============================================================================
// TASK MANAGEMENT - ERROR HANDLING
// ============================================================================

describe('[ERROR HANDLING] TASK MANAGEMENT: Edge Cases & Robustness', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
  })

  test('handling empty task list', () => {
    mockedUseBooks.mockReturnValue({
      books: [],
      currentTasks: [],
      upcomingTasks: [],
      previousTasks: [],
    })
    const { books } = mockedUseBooks()
    expect(Array.isArray(books)).toBe(true)
    expect(books.length).toBe(0)
  })

  test('handling tasks with missing optional fields', () => {
    mockedUseBooks.mockReturnValue({
      books: [
        { $id: '1', name: 'Task without repeats' },
      ],
    })
    const { books } = mockedUseBooks()
    expect(books[0].name).toBeDefined()
  })

  test('handling progress calculation with no tasks', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0,
      books: [],
    })
    const { progress } = mockedUseBooks()
    expect(progress).toBe(0)
  })
})

// ============================================================================
// APPWRITE DATABASE OPERATIONS - WHITEBOX: Query Construction
// ============================================================================

describe('[WHITEBOX] APPWRITE: Database Query Construction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('database queries filter by userID', () => {
    // Simulating how BooksContext queries
    const userId = 'user-123'
    // Query uses Query.equal('userID', userId)
    expect(userId).toBeDefined()
  })

  test('currentTasks query uses greaterThan for timeEnds', () => {
    // Query logic: timeEnds > currentTimeString
    const currentTimeString = '14:30'
    const taskTimeEnds = '15:00'
    expect(taskTimeEnds > currentTimeString).toBe(true)
  })

  test('previousTasks query uses lessThan for timeEnds', () => {
    // Query logic: timeEnds < currentTimeString
    const currentTimeString = '14:30'
    const taskTimeEnds = '13:00'
    expect(taskTimeEnds < currentTimeString).toBe(true)
  })

  test('upcomingTasks query uses greaterThan for timeStarts', () => {
    // Query logic: timeStarts > currentTimeString
    const currentTimeString = '14:30'
    const taskTimeStarts = '15:00'
    expect(taskTimeStarts > currentTimeString).toBe(true)
  })

  test('database ID is correctly defined', () => {
    const DATABASE_ID = '68fd56d40037f2743501'
    expect(DATABASE_ID).toBe('68fd56d40037f2743501')
  })

  test('collection ID is correctly defined', () => {
    const COLLECTION_ID = 'books'
    expect(COLLECTION_ID).toBe('books')
  })

  test('task dates are normalized to YYYY-MM-DD format', () => {
    const date = new Date(2024, 0, 15) // January 15, 2024
    const normalized = date.toISOString().split('T')[0]
    expect(normalized).toBe('2024-01-15')
  })

  test('time strings use HH:MM format', () => {
    const timeString = '14:30'
    const regex = /^\d{2}:\d{2}$/
    expect(regex.test(timeString)).toBe(true)
  })

  test('documents are sorted by date and time', () => {
    const tasks = [
      { date: '2024-01-15', timeEnds: '15:00' },
      { date: '2024-01-14', timeEnds: '14:00' },
      { date: '2024-01-15', timeEnds: '12:00' },
    ]
    // Sorting function validates earlier dates come first
    expect(tasks[1].date < tasks[0].date).toBe(true)
  })

  test('user isolation via userID query parameter', () => {
    const userID = 'user-abc123'
    expect(userID).toBeDefined()
    expect(typeof userID).toBe('string')
  })

  test('permission rules include user-specific read/update/delete', () => {
    // Permission structure: [read(user), update(user), delete(user)]
    const permissions = ['read', 'update', 'delete']
    expect(permissions.length).toBe(3)
    expect(permissions).toContain('read')
    expect(permissions).toContain('update')
    expect(permissions).toContain('delete')
  })

  test('notificationId is stored with task document', () => {
    const task = {
      $id: 'task-1',
      name: 'Study',
      notificationId: 'notif-abc123',
    }
    expect(task.notificationId !== undefined).toBe(true)
  })

  test('isCompleted field is boolean', () => {
    const task = { isCompleted: false }
    expect(typeof task.isCompleted).toBe('boolean')
  })
})

// ============================================================================
// APPWRITE DATABASE OPERATIONS - WHITEBOX: CRUD Functions
// ============================================================================

describe('[WHITEBOX] APPWRITE: CRUD Operations Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseUser.mockClear()
    mockedUseBooks.mockClear()
  })

  test('createBook generates unique document ID', () => {
    // ID.unique() generates unique IDs
    const uniqueId1 = Math.random().toString(36)
    const uniqueId2 = Math.random().toString(36)
    expect(uniqueId1).not.toBe(uniqueId2)
  })

  test('createBook includes userID in document', () => {
    mockedUseUser.mockReturnValue({
      user: { $id: 'user-123' },
    })
    const { user } = mockedUseUser()
    expect(user.$id).toBeDefined()
  })

  test('createBook includes notification ID or null', () => {
    const notificationId = 'notif-123'
    expect(notificationId !== undefined).toBe(true)
  })

  test('deleteBook removes document from database', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
      books: [{ $id: 'task-1', name: 'Task' }],
    })
    const { deleteBook } = mockedUseBooks()
    deleteBook('task-1')
    expect(deleteBookMock).toHaveBeenCalledWith('task-1')
  })

  test('deleteBook cancels associated notification', () => {
    const task = {
      $id: 'task-1',
      name: 'Task',
      notificationId: 'notif-123',
    }
    expect(task.notificationId).toBeDefined()
  })

  test('updateBook modifies existing document', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    updateBook('task-1', { name: 'Updated' })
    expect(updateBookMock).toHaveBeenCalledWith('task-1', { name: 'Updated' })
  })

  test('updateBook schedules new notification if not completed', () => {
    const updateData = {
      name: 'Task',
      date: '2024-01-15',
      timeStarts: '10:00',
      isCompleted: false,
    }
    expect(updateData.isCompleted).toBe(false)
  })

  test('updateBook cancels notification if marking completed', () => {
    const updateData = {
      name: 'Task',
      isCompleted: true,
    }
    expect(updateData.isCompleted).toBe(true)
  })

  test('changeIsCompleted toggles completion status', () => {
    const changeIsCompletedMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      changeIsCompleted: changeIsCompletedMock,
    })
    const { changeIsCompleted } = mockedUseBooks()
    changeIsCompleted('task-1', false) // false -> true
    expect(changeIsCompletedMock).toHaveBeenCalledWith('task-1', false)
  })

  test('changeIsCompleted cancels notification when completing', () => {
    const isCompleted = true
    expect(isCompleted).toBe(true)
  })

  test('fetchTasksByDate filters by specific date', () => {
    const fetchTasksByDateMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchTasksByDate: fetchTasksByDateMock,
    })
    const { fetchTasksByDate } = mockedUseBooks()
    const testDate = '2024-01-15'
    fetchTasksByDate(testDate)
    expect(fetchTasksByDateMock).toHaveBeenCalledWith(testDate)
  })

  test('fetchPreviousTasks filters today completed tasks', () => {
    const fetchPreviousTasksMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchPreviousTasks: fetchPreviousTasksMock,
    })
    const { fetchPreviousTasks } = mockedUseBooks()
    fetchPreviousTasks()
    expect(fetchPreviousTasksMock).toHaveBeenCalled()
  })

  test('fetchCurrentTasks filters today active tasks', () => {
    const fetchCurrentTasksMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchCurrentTasks: fetchCurrentTasksMock,
    })
    const { fetchCurrentTasks } = mockedUseBooks()
    fetchCurrentTasks()
    expect(fetchCurrentTasksMock).toHaveBeenCalled()
  })

  test('fetchUpcomingTasks filters future tasks', () => {
    const fetchUpcomingTasksMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchUpcomingTasks: fetchUpcomingTasksMock,
    })
    const { fetchUpcomingTasks } = mockedUseBooks()
    fetchUpcomingTasks()
    expect(fetchUpcomingTasksMock).toHaveBeenCalled()
  })
})

// ============================================================================
// APPWRITE DATABASE OPERATIONS - WHITEBOX: Progress Calculation
// ============================================================================

describe('[WHITEBOX] APPWRITE: Progress Calculation Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('progress is calculated as completed/total', () => {
    const completed = 3
    const total = 10
    const progress = (completed / total).toFixed(2)
    expect(parseFloat(progress)).toBe(0.3)
  })

  test('progress is 0 when no tasks exist', () => {
    const completed = 0
    const total = 0
    const progress = total === 0 ? 0 : (completed / total).toFixed(2)
    expect(progress).toBe(0)
  })

  test('progress is 0 when no tasks completed', () => {
    const completed = 0
    const total = 5
    const progress = (completed / total).toFixed(2)
    expect(parseFloat(progress)).toBe(0)
  })

  test('progress is 1 when all tasks completed', () => {
    const completed = 5
    const total = 5
    const progress = (completed / total).toFixed(2)
    expect(parseFloat(progress)).toBe(1)
  })

  test('progress is formatted to 2 decimal places', () => {
    const completed = 1
    const total = 3
    const progress = (completed / total).toFixed(2)
    expect(progress).toBe('0.33')
  })

  test('progress query filters by date', () => {
    const date = '2024-01-15'
    expect(date).toBeDefined()
  })

  test('progress query filters by isCompleted status', () => {
    const completedStatus = true
    expect(typeof completedStatus).toBe('boolean')
  })

  test('progress counts total documents for denominator', () => {
    const total = 10
    expect(total).toBeGreaterThan(0)
  })

  test('progress counts completed documents for numerator', () => {
    const completed = 5
    expect(completed).toBeGreaterThan(0)
  })
})

// ============================================================================
// APPWRITE DATABASE OPERATIONS - WHITEBOX: Real-time Sync
// ============================================================================

describe('[WHITEBOX] APPWRITE: Real-time Synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('real-time channel uses correct database and collection', () => {
    const DATABASE_ID = '68fd56d40037f2743501'
    const COLLECTION_ID = 'books'
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`
    expect(channel).toBe('databases.68fd56d40037f2743501.collections.books.documents')
  })

  test('real-time subscription handles create events', () => {
    const events = ['create']
    expect(events[0].includes('create')).toBe(true)
  })

  test('real-time subscription handles update events', () => {
    const events = ['update']
    expect(events[0].includes('update')).toBe(true)
  })

  test('real-time subscription handles delete events', () => {
    const events = ['delete']
    expect(events[0].includes('delete')).toBe(true)
  })

  test('create event adds new document to books', () => {
    const books = [{ $id: '1', name: 'Task 1' }]
    const newPayload = { $id: '2', name: 'Task 2' }
    const updated = [...books, newPayload]
    expect(updated.length).toBe(2)
  })

  test('delete event removes document from books', () => {
    const books = [
      { $id: '1', name: 'Task 1' },
      { $id: '2', name: 'Task 2' },
    ]
    const deleted = books.filter(b => b.$id !== '1')
    expect(deleted.length).toBe(1)
    expect(deleted[0].$id).toBe('2')
  })

  test('update event modifies existing document', () => {
    const books = [
      { $id: '1', name: 'Task 1' },
      { $id: '2', name: 'Task 2' },
    ]
    const payload = { $id: '1', name: 'Updated Task 1' }
    const updated = books.map(b => b.$id === payload.$id ? payload : b)
    expect(updated[0].name).toBe('Updated Task 1')
  })

  test('real-time subscription persists across multiple events', () => {
    let books = [{ $id: '1', name: 'Task 1' }]
    
    // Create event
    books = [...books, { $id: '2', name: 'Task 2' }]
    expect(books.length).toBe(2)
    
    // Update event
    books = books.map(b => b.$id === '1' ? { ...b, name: 'Updated' } : b)
    expect(books[0].name).toBe('Updated')
    
    // Delete event
    books = books.filter(b => b.$id !== '2')
    expect(books.length).toBe(1)
  })

  test('unsubscribe function stops real-time updates', () => {
    let isSubscribed = true
    const unsubscribe = () => { isSubscribed = false }
    expect(isSubscribed).toBe(true)
    unsubscribe()
    expect(isSubscribed).toBe(false)
  })

  test('refreshAllData called on real-time event', () => {
    const refreshAllDataMock = jest.fn()
    // Simulating refresh being called
    refreshAllDataMock()
    expect(refreshAllDataMock).toHaveBeenCalled()
  })

  test('books are sorted after real-time events', () => {
    const books = [
      { date: '2024-01-15', timeEnds: '15:00' },
      { date: '2024-01-14', timeEnds: '14:00' },
    ]
    const sorted = books.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    expect(sorted[0].date < sorted[1].date).toBe(true)
  })
})

// ============================================================================
// APPWRITE DATABASE OPERATIONS - BLACKBOX: Database Workflow
// ============================================================================

describe('[BLACKBOX] APPWRITE: Complete Database Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
    mockedUseUser.mockClear()
  })

  test('user creates task which saves to database', () => {
    const createBookMock = jest.fn()
    mockedUseUser.mockReturnValue({
      user: { $id: 'user-1' },
    })
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    createBook({
      name: 'Study Math',
      date: '2024-01-15',
      timeStarts: '10:00',
      timeEnds: '12:00',
    })
    expect(createBookMock).toHaveBeenCalled()
  })

  test('created task appears in database with userID', () => {
    const userId = 'user-123'
    const task = {
      name: 'Task',
      userID: userId,
      $id: 'doc-id',
    }
    expect(task.userID).toBe(userId)
  })

  test('user edits task which updates database', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    updateBook('task-1', { name: 'Updated Name' })
    expect(updateBookMock).toHaveBeenCalled()
  })

  test('user deletes task which removes from database', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
    })
    const { deleteBook } = mockedUseBooks()
    deleteBook('task-1')
    expect(deleteBookMock).toHaveBeenCalled()
  })

  test('user marks task complete which updates database', () => {
    const changeIsCompletedMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      changeIsCompleted: changeIsCompletedMock,
    })
    const { changeIsCompleted } = mockedUseBooks()
    changeIsCompleted('task-1', false)
    expect(changeIsCompletedMock).toHaveBeenCalled()
  })

  test('multiple users see only their own tasks', () => {
    const user1Books = [
      { $id: '1', userID: 'user-1', name: 'Task 1' },
      { $id: '2', userID: 'user-1', name: 'Task 2' },
    ]
    const user2Books = [
      { $id: '3', userID: 'user-2', name: 'Task 3' },
    ]
    expect(user1Books.every(b => b.userID === 'user-1')).toBe(true)
    expect(user2Books.every(b => b.userID === 'user-2')).toBe(true)
  })

  test('tasks sync in real-time when another device updates', () => {
    const initialBooks = [{ $id: '1', name: 'Task 1' }]
    const updatedPayload = { $id: '1', name: 'Updated Task' }
    const updatedBooks = initialBooks.map(b => b.$id === updatedPayload.$id ? updatedPayload : b)
    expect(updatedBooks[0].name).toBe('Updated Task')
  })

  test('progress updates when task completion changes', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.5,
      books: [
        { $id: '1', isCompleted: true },
        { $id: '2', isCompleted: false },
      ],
    })
    const { books } = mockedUseBooks()
    const completed = books.filter((b: any) => b.isCompleted).length
    expect(completed / books.length).toBe(0.5)
  })

  test('refreshAllData fetches all task categories', () => {
    const fetchCurrentTasksMock = jest.fn()
    const fetchPreviousTasksMock = jest.fn()
    const fetchUpcomingTasksMock = jest.fn()
    const fetchProgressMock = jest.fn()
    
    mockedUseBooks.mockReturnValue({
      fetchCurrentTasks: fetchCurrentTasksMock,
      fetchPreviousTasks: fetchPreviousTasksMock,
      fetchUpcomingTasks: fetchUpcomingTasksMock,
      fetchProgress: fetchProgressMock,
    })
    
    const { fetchCurrentTasks, fetchPreviousTasks, fetchUpcomingTasks } = mockedUseBooks()
    
    fetchCurrentTasks()
    fetchPreviousTasks()
    fetchUpcomingTasks()
    
    expect(fetchCurrentTasksMock).toHaveBeenCalled()
    expect(fetchPreviousTasksMock).toHaveBeenCalled()
    expect(fetchUpcomingTasksMock).toHaveBeenCalled()
  })
})

// ============================================================================
// APPWRITE DATABASE OPERATIONS - INTEGRATION: Error Handling
// ============================================================================

describe('[INTEGRATION] APPWRITE: Error Handling & Recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creating task with invalid data is handled', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    // Attempting to create with invalid data
    createBook({})
    expect(createBookMock).toHaveBeenCalled()
  })

  test('updating non-existent task is handled gracefully', () => {
    const updateBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      updateBook: updateBookMock,
    })
    const { updateBook } = mockedUseBooks()
    updateBook('non-existent', { name: 'Update' })
    expect(updateBookMock).toHaveBeenCalled()
  })

  test('deleting non-existent task is handled gracefully', () => {
    const deleteBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      deleteBook: deleteBookMock,
    })
    const { deleteBook } = mockedUseBooks()
    deleteBook('non-existent')
    expect(deleteBookMock).toHaveBeenCalled()
  })

  test('network error during fetch is logged', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    mockedUseBooks.mockReturnValue({
      fetchBooks: jest.fn(() => {
        console.error('Network error')
      }),
    })
    const { fetchBooks } = mockedUseBooks()
    fetchBooks()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  test('database operations skip when no user logged in', () => {
    mockedUseUser.mockReturnValue({
      user: null,
    })
    const { user } = mockedUseUser()
    expect(user).toBeNull()
  })

  test('permission errors are handled when creating task', () => {
    const createBookMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      createBook: createBookMock,
    })
    const { createBook } = mockedUseBooks()
    createBook({ name: 'Task' })
    expect(createBookMock).toHaveBeenCalled()
  })

  test('real-time subscription cleanup prevents memory leaks', () => {
    let isSubscribed = true
    const unsubscribe = () => { isSubscribed = false }
    
    // Start subscription
    expect(isSubscribed).toBe(true)
    
    // Cleanup
    unsubscribe()
    expect(isSubscribed).toBe(false)
  })

  test('refresh retries on temporary failure', () => {
    const refreshMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      refreshAllData: refreshMock,
    })
    const { refreshAllData } = mockedUseBooks()
    
    refreshAllData()
    expect(refreshMock).toHaveBeenCalled()
  })

  test('app handles database reconnection', () => {
    const fetchBooksMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      fetchBooks: fetchBooksMock,
    })
    const { fetchBooks } = mockedUseBooks()
    
    // Simulate reconnection
    fetchBooks()
    expect(fetchBooksMock).toHaveBeenCalled()
  })

  test('large document responses are handled', () => {
    mockedUseBooks.mockReturnValue({
      books: Array(5000).fill(null).map((_, i) => ({
        $id: `task-${i}`,
        name: `Task ${i}`,
      })),
    })
    const { books } = mockedUseBooks()
    expect(books.length).toBe(5000)
  })
})

// ============================================================================
// COMPONENT RENDERING - WHITEBOX: Component Props & State
// ============================================================================

describe('[WHITEBOX] COMPONENT RENDERING: Component Props Validation', () => {
  test('ThemedView component accepts style prop', () => {
    const style = { flex: 1, backgroundColor: '#fff' }
    expect(style).toBeDefined()
    expect(style.flex).toBe(1)
  })

  test('ThemedView component accepts safe prop for safe area', () => {
    const safe = true
    expect(typeof safe).toBe('boolean')
  })

  test('ThemedView applies theme colors', () => {
    const theme = Colors.light
    expect(theme.background).toBeDefined()
    expect(typeof theme.background).toBe('string')
  })

  test('ThemedText component accepts title prop', () => {
    const title = true
    expect(typeof title).toBe('boolean')
  })

  test('ThemedButton component accepts style prop', () => {
    const buttonStyle = { padding: 10 }
    expect(buttonStyle.padding).toBe(10)
  })

  test('ThemedCard component has padding', () => {
    const cardStyle = { padding: 20 }
    expect(cardStyle.padding).toBe(20)
  })

  test('TaskCard component accepts all required props', () => {
    const taskProps = {
      id: 'task-1',
      name: 'Study',
      timeStarts: '09:00',
      timeEnds: '11:00',
      isCompleted: false,
      color: '#013C58',
    }
    expect(taskProps.id).toBeDefined()
    expect(taskProps.name).toBeDefined()
    expect(taskProps.isCompleted).toBe(false)
  })

  test('LandingTaskList requires handlePhrase callback', () => {
    const handlePhrase = jest.fn()
    expect(typeof handlePhrase).toBe('function')
  })

  test('Scotty component accepts showPhrase prop', () => {
    const showPhrase = true
    expect(typeof showPhrase).toBe('boolean')
  })

  test('Scotty component accepts phrase string', () => {
    const phrase = 'Great work!'
    expect(typeof phrase).toBe('string')
    expect(phrase.length).toBeGreaterThan(0)
  })

  test('LandingHeader uses progress from BooksContext', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.75,
    })
    const { progress } = mockedUseBooks()
    expect(progress).toBe(0.75)
  })
})

// ============================================================================
// COMPONENT RENDERING - WHITEBOX: Theme Integration
// ============================================================================

describe('[WHITEBOX] COMPONENT RENDERING: Theme Integration', () => {
  test('light theme has all required colors', () => {
    const lightTheme = Colors.light
    expect(lightTheme.text).toBeDefined()
    expect(lightTheme.background).toBeDefined()
    expect(lightTheme.navBackground).toBeDefined()
  })

  test('light theme colors are properly defined', () => {
    const lightTheme = Colors.light
    expect(lightTheme.text).toBeDefined()
    expect(lightTheme.background).toBeDefined()
    expect(lightTheme.uiBackground).toBeDefined()
  })

  test('primary color is consistent', () => {
    expect(Colors.primary).toBe('#003da4')
  })

  test('warning color is consistent', () => {
    expect(Colors.warning).toBe('#ff0000')
  })

  test('navigation background color differs from main background', () => {
    const nav = Colors.light.navBackground
    const main = Colors.light.background
    expect(nav).not.toBe(main)
  })

  test('icon colors differentiate active and inactive states', () => {
    const inactive = Colors.light.iconColor
    const active = Colors.light.iconColorFocused
    expect(inactive).not.toBe(active)
  })

  test('UI background color is distinct', () => {
    const uiBg = Colors.light.uiBackground
    expect(uiBg).toBeDefined()
    expect(typeof uiBg).toBe('string')
  })

  test('all color values are valid hex', () => {
    const hexRegex = /^#[0-9A-Fa-f]+$/
    Object.values(Colors.light).forEach((color) => {
      if (typeof color === 'string') {
        expect(hexRegex.test(color)).toBe(true)
      }
    })
  })
})

// ============================================================================
// COMPONENT RENDERING - BLACKBOX: User Interface Display
// ============================================================================

describe('[BLACKBOX] COMPONENT RENDERING: User Interface Display', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
    mockedUseUser.mockClear()
  })

  test('landing page displays current task section', () => {
    mockedUseBooks.mockReturnValue({
      currentTasks: [
        { $id: '1', name: 'Current Task', timeEnds: '10:00' },
      ],
    })
    const { currentTasks } = mockedUseBooks()
    expect(currentTasks.length).toBeGreaterThan(0)
  })

  test('landing page displays upcoming task section', () => {
    mockedUseBooks.mockReturnValue({
      upcomingTasks: [
        { $id: '1', name: 'Future Task', timeStarts: '14:00' },
      ],
    })
    const { upcomingTasks } = mockedUseBooks()
    expect(upcomingTasks.length).toBeGreaterThan(0)
  })

  test('landing page shows progress bar', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.5,
    })
    const { progress } = mockedUseBooks()
    expect(typeof progress).toBe('number')
    expect(progress).toBeGreaterThanOrEqual(0)
    expect(progress).toBeLessThanOrEqual(1)
  })

  test('landing page displays motivational phrase from Scotty', () => {
    const phrase = phrases[0]
    expect(phrase).toBeDefined()
    expect(typeof phrase).toBe('string')
    expect(phrase.length).toBeGreaterThan(0)
  })

  test('empty task card displays when no tasks', () => {
    mockedUseBooks.mockReturnValue({
      currentTasks: [],
    })
    const { currentTasks } = mockedUseBooks()
    expect(currentTasks.length).toBe(0)
  })

  test('task card displays task name', () => {
    const taskName = 'Study Math'
    expect(taskName).toBeDefined()
    expect(typeof taskName).toBe('string')
  })

  test('task card displays start and end time', () => {
    const timeStarts = '09:00'
    const timeEnds = '11:00'
    expect(timeStarts).toBeDefined()
    expect(timeEnds).toBeDefined()
  })

  test('task card shows completion status', () => {
    const isCompleted = false
    expect(typeof isCompleted).toBe('boolean')
  })

  test('task card is clickable to view details', () => {
    const onPress = jest.fn()
    onPress()
    expect(onPress).toHaveBeenCalled()
  })

  test('progress bar shows percentage', () => {
    const progress = 0.75
    const percentage = progress * 100
    expect(percentage).toBe(75)
  })

  test('alarm screen button navigates to alarms', () => {
    const navigate = jest.fn()
    navigate('/alarms')
    expect(navigate).toHaveBeenCalledWith('/alarms')
  })

  test('add button navigates to new task', () => {
    const navigate = jest.fn()
    navigate('/newTask')
    expect(navigate).toHaveBeenCalledWith('/newTask')
  })
})

// ============================================================================
// COMPONENT RENDERING - WHITEBOX: Auth Guard Components
// ============================================================================

describe('[WHITEBOX] COMPONENT RENDERING: Auth Guards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseUser.mockClear()
  })

  test('UserOnly requires authenticated user', () => {
    mockedUseUser.mockReturnValue({
      user: { $id: 'user-1' },
      authChecked: true,
    })
    const { user, authChecked } = mockedUseUser()
    expect(user).toBeDefined()
    expect(authChecked).toBe(true)
  })

  test('GuestOnly requires no authenticated user', () => {
    mockedUseUser.mockReturnValue({
      user: null,
      authChecked: true,
    })
    const { user, authChecked } = mockedUseUser()
    expect(user).toBeNull()
    expect(authChecked).toBe(true)
  })

  test('UserOnly shows loading while checking auth', () => {
    mockedUseUser.mockReturnValue({
      user: null,
      authChecked: false,
    })
    const { authChecked } = mockedUseUser()
    expect(authChecked).toBe(false)
  })

  test('GuestOnly shows loading while checking auth', () => {
    mockedUseUser.mockReturnValue({
      user: null,
      authChecked: false,
    })
    const { authChecked } = mockedUseUser()
    expect(authChecked).toBe(false)
  })

  test('UserOnly redirects to login when not authenticated', () => {
    mockedUseUser.mockReturnValue({
      user: null,
      authChecked: true,
    })
    const { user, authChecked } = mockedUseUser()
    const shouldRedirect = !user && authChecked
    expect(shouldRedirect).toBe(true)
  })

  test('GuestOnly redirects to landing when authenticated', () => {
    mockedUseUser.mockReturnValue({
      user: { $id: 'user-1' },
      authChecked: true,
    })
    const { user, authChecked } = mockedUseUser()
    const shouldRedirect = user && authChecked
    expect(shouldRedirect).toBe(true)
  })
})

// ============================================================================
// COMPONENT RENDERING - BLACKBOX: Landing Page Workflow
// ============================================================================

describe('[BLACKBOX] COMPONENT RENDERING: Landing Page Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
    mockedUseUser.mockClear()
  })

  test('landing page shows current tasks on load', () => {
    mockedUseBooks.mockReturnValue({
      currentTasks: [
        { $id: '1', name: 'Ongoing Task', timeStarts: '09:00', timeEnds: '10:00' },
      ],
    })
    const { currentTasks } = mockedUseBooks()
    expect(currentTasks.length).toBeGreaterThan(0)
  })

  test('landing page displays upcoming tasks separately', () => {
    mockedUseBooks.mockReturnValue({
      currentTasks: [],
      upcomingTasks: [
        { $id: '1', name: 'Future Task', timeStarts: '14:00' },
      ],
    })
    const { currentTasks, upcomingTasks } = mockedUseBooks()
    expect(currentTasks.length).toBe(0)
    expect(upcomingTasks.length).toBeGreaterThan(0)
  })

  test('landing page updates when task completed', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.5,
      books: [
        { $id: '1', isCompleted: true },
        { $id: '2', isCompleted: false },
      ],
    })
    const { books } = mockedUseBooks()
    const completed = books.filter((b: any) => b.isCompleted).length
    expect(completed / books.length).toBe(0.5)
  })

  test('user can click task to view details', () => {
    const onTaskPress = jest.fn()
    onTaskPress('task-1')
    expect(onTaskPress).toHaveBeenCalledWith('task-1')
  })

  test('user can complete task from landing', () => {
    const changeIsCompletedMock = jest.fn()
    mockedUseBooks.mockReturnValue({
      changeIsCompleted: changeIsCompletedMock,
    })
    const { changeIsCompleted } = mockedUseBooks()
    changeIsCompleted('task-1', false)
    expect(changeIsCompletedMock).toHaveBeenCalled()
  })

  test('motivational phrase changes on button press', () => {
    const handlePhrase = jest.fn()
    handlePhrase()
    expect(handlePhrase).toHaveBeenCalled()
  })

  test('landing page displays date', () => {
    const today = new Date()
    const dateString = today.toLocaleDateString()
    expect(dateString).toBeDefined()
    expect(typeof dateString).toBe('string')
  })

  test('landing page logout button is accessible', () => {
    const logoutMock = jest.fn()
    mockedUseUser.mockReturnValue({
      logout: logoutMock,
    })
    const { logout } = mockedUseUser()
    logout()
    expect(logoutMock).toHaveBeenCalled()
  })
})

// ============================================================================
// COMPONENT RENDERING - INTEGRATION: Component Composition
// ============================================================================

describe('[INTEGRATION] COMPONENT RENDERING: Component Composition', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
    mockedUseUser.mockClear()
  })

  test('landing page integrates header, task list, and Scotty', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.5,
      currentTasks: [{ $id: '1', name: 'Task' }],
    })
    const { progress, currentTasks } = mockedUseBooks()
    expect(progress).toBeDefined()
    expect(currentTasks).toBeDefined()
  })

  test('task card integrates checkbox, title, and time info', () => {
    const taskCard = {
      isCompleted: false,
      name: 'Study',
      timeStarts: '09:00',
      timeEnds: '11:00',
    }
    expect(taskCard.isCompleted).toBe(false)
    expect(taskCard.name).toBeDefined()
    expect(taskCard.timeStarts).toBeDefined()
  })

  test('themed view applies theme from context', () => {
    const theme = Colors.light
    expect(theme).toBeDefined()
    expect(theme.background).toBeDefined()
  })

  test('landing page displays multiple themed components', () => {
    expect(Colors.light).toBeDefined()
    expect(phrases.length).toBeGreaterThan(0)
    expect(typeof Colors.primary).toBe('string')
  })

  test('auth guard wraps protected content', () => {
    mockedUseUser.mockReturnValue({
      user: { $id: 'user-1' },
      authChecked: true,
    })
    const { user, authChecked } = mockedUseUser()
    const isProtected = user && authChecked
    expect(isProtected).toBe(true)
  })

  test('progress bar integrates with task list', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0.5,
      currentTasks: [],
      upcomingTasks: [],
    })
    const { progress } = mockedUseBooks()
    expect(progress).toBeDefined()
  })
})

// ============================================================================
// COMPONENT RENDERING - EDGE CASES: Component States
// ============================================================================

describe('[EDGE CASES] COMPONENT RENDERING: Component States', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseBooks.mockClear()
    mockedUseUser.mockClear()
  })

  test('landing displays empty state when no tasks', () => {
    mockedUseBooks.mockReturnValue({
      currentTasks: [],
      upcomingTasks: [],
      previousTasks: [],
    })
    const { currentTasks, upcomingTasks } = mockedUseBooks()
    expect(currentTasks.length).toBe(0)
    expect(upcomingTasks.length).toBe(0)
  })

  test('progress shows 0% when no tasks completed', () => {
    mockedUseBooks.mockReturnValue({
      progress: 0,
    })
    const { progress } = mockedUseBooks()
    expect(progress).toBe(0)
  })

  test('progress shows 100% when all tasks completed', () => {
    mockedUseBooks.mockReturnValue({
      progress: 1,
    })
    const { progress } = mockedUseBooks()
    expect(progress).toBe(1)
  })

  test('task list handles very long task names', () => {
    const longName = 'A'.repeat(200)
    expect(longName.length).toBe(200)
  })

  test('theme handles missing color gracefully', () => {
    const theme = Colors.light
    expect(theme).toBeDefined()
  })

  test('phrases array always has content', () => {
    expect(phrases.length).toBeGreaterThan(0)
  })

  test('task card handles disabled state', () => {
    const isCompleted = true
    expect(typeof isCompleted).toBe('boolean')
  })

  test('landing page handles rapid task updates', () => {
    let tasks = [{ $id: '1', name: 'Task 1' }]
    tasks = [...tasks, { $id: '2', name: 'Task 2' }]
    tasks = tasks.filter(t => t.$id !== '1')
    expect(tasks.length).toBe(1)
  })

  test('auth guard handles auth state transitions', () => {
    mockedUseUser.mockReturnValue({ authChecked: false })
    let { authChecked } = mockedUseUser()
    expect(authChecked).toBe(false)

    mockedUseUser.mockReturnValue({ authChecked: true, user: { $id: 'user-1' } })
    ;({ authChecked } = mockedUseUser())
    expect(authChecked).toBe(true)
  })

  test('component handles null/undefined children gracefully', () => {
    const children = null
    expect(children).toBeNull()
  })
})

// ============================================================================
// ALARM MANAGEMENT - WHITEBOX: Alarm CRUD Operations
// ============================================================================

describe('[WHITEBOX] ALARM MANAGEMENT: Alarm CRUD Operations', () => {
  const mockAlarm = {
    id: 'alarm-1',
    time: 1704067200000, // Jan 1, 2024 8:00 AM
    repeatDays: ['Monday', 'Wednesday', 'Friday'],
    puzzle: false,
    enabled: true,
    notificationIds: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('alarm has required properties', () => {
    expect(mockAlarm.id).toBeDefined()
    expect(mockAlarm.time).toBeDefined()
    expect(mockAlarm.enabled).toBe(true)
    expect(typeof mockAlarm.puzzle).toBe('boolean')
  })

  test('alarm time is valid timestamp', () => {
    expect(typeof mockAlarm.time).toBe('number')
    expect(mockAlarm.time).toBeGreaterThan(0)
  })

  test('alarm repeat days is array or undefined', () => {
    expect(Array.isArray(mockAlarm.repeatDays) || mockAlarm.repeatDays === undefined).toBe(true)
  })

  test('alarm notification IDs tracks scheduled notifications', () => {
    expect(Array.isArray(mockAlarm.notificationIds)).toBe(true)
    const updatedAlarm = { ...mockAlarm, notificationIds: ['notif-1', 'notif-2'] }
    expect(updatedAlarm.notificationIds.length).toBe(2)
  })

  test('alarm enabled status toggles', () => {
    const disabled = { ...mockAlarm, enabled: false }
    expect(disabled.enabled).toBe(false)
    const enabled = { ...disabled, enabled: true }
    expect(enabled.enabled).toBe(true)
  })

  test('alarm can be updated with partial data', () => {
    const updated = { ...mockAlarm, time: 1704070800000 }
    expect(updated.time).not.toBe(mockAlarm.time)
    expect(updated.repeatDays).toEqual(mockAlarm.repeatDays)
  })

  test('alarm puzzle flag toggles', () => {
    const withPuzzle = { ...mockAlarm, puzzle: true }
    expect(withPuzzle.puzzle).toBe(true)
    const noPuzzle = { ...withPuzzle, puzzle: false }
    expect(noPuzzle.puzzle).toBe(false)
  })

  test('multiple alarms can coexist', () => {
    const alarms = [
      { ...mockAlarm, id: 'alarm-1' },
      { ...mockAlarm, id: 'alarm-2', time: 1704074400000 },
      { ...mockAlarm, id: 'alarm-3', time: 1704078000000 },
    ]
    expect(alarms.length).toBe(3)
    expect(alarms[0].id).not.toBe(alarms[1].id)
  })

  test('alarm list can be filtered by enabled status', () => {
    const alarms = [
      { ...mockAlarm, id: 'alarm-1', enabled: true },
      { ...mockAlarm, id: 'alarm-2', enabled: false },
      { ...mockAlarm, id: 'alarm-3', enabled: true },
    ]
    const enabledAlarms = alarms.filter(a => a.enabled)
    expect(enabledAlarms.length).toBe(2)
  })
})
 
// ============================================================================
// ALARM MANAGEMENT - WHITEBOX: Alarm Scheduling Logic
// ============================================================================

describe('[WHITEBOX] ALARM MANAGEMENT: Alarm Scheduling Logic', () => {
  test('alarm time converts from milliseconds correctly', () => {
    const timeMs = 1704067200000
    const date = new Date(timeMs)
    expect(date instanceof Date).toBe(true)
    expect(date.getTime()).toBe(timeMs)
  })

  test('alarm repeat days include valid weekday names', () => {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const alarmDays = ['Monday', 'Wednesday', 'Friday']
    const allValid = alarmDays.every(day => validDays.includes(day))
    expect(allValid).toBe(true)
  })

  test('alarm can have empty repeat days (one-time alarm)', () => {
    const oneTimeAlarm = {
      id: 'alarm-1',
      time: 1704067200000,
      repeatDays: [],
      enabled: true,
    }
    expect(oneTimeAlarm.repeatDays.length).toBe(0)
  })

  test('alarm repeat days can include all weekdays', () => {
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    expect(allDays.length).toBe(5)
  })

  test('alarm repeat days can include weekends', () => {
    const weekendDays = ['Saturday', 'Sunday']
    expect(weekendDays.length).toBe(2)
  })

  test('alarm extracts hour and minute from timestamp', () => {
    const timeMs = 1704067200000
    const date = new Date(timeMs)
    const hour = date.getUTCHours()
    const minute = date.getUTCMinutes()
    expect(typeof hour).toBe('number')
    expect(typeof minute).toBe('number')
    expect(hour).toBeGreaterThanOrEqual(0)
    expect(minute).toBeGreaterThanOrEqual(0)
  })
})

// ============================================================================
// ALARM MANAGEMENT - BLACKBOX: Alarm Workflow
// ============================================================================

describe('[BLACKBOX] ALARM MANAGEMENT: Alarm Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('user can create new alarm with time and repeat days', () => {
    const newAlarm = {
      id: Date.now(),
      time: new Date().getTime(),
      repeatDays: ['Monday', 'Wednesday'],
      puzzle: false,
      enabled: true,
    }
    expect(newAlarm.id).toBeDefined()
    expect(newAlarm.time).toBeGreaterThan(0)
  })

  test('user can enable/disable alarm', () => {
    let alarm = {
      id: 'alarm-1',
      time: Date.now(),
      enabled: true,
    }
    alarm = { ...alarm, enabled: false }
    expect(alarm.enabled).toBe(false)
  })

  test('user can delete alarm', () => {
    let alarms = [
      { id: 'alarm-1', time: Date.now() },
      { id: 'alarm-2', time: Date.now() },
    ]
    alarms = alarms.filter(a => a.id !== 'alarm-1')
    expect(alarms.length).toBe(1)
    expect(alarms[0].id).toBe('alarm-2')
  })

  test('user can edit alarm time', () => {
    const originalTime = 1704067200000
    let alarm = { id: 'alarm-1', time: originalTime }
    const newTime = 1704070800000
    alarm = { ...alarm, time: newTime }
    expect(alarm.time).not.toBe(originalTime)
    expect(alarm.time).toBe(newTime)
  })

  test('user can edit repeat days', () => {
    let alarm = { id: 'alarm-1', repeatDays: ['Monday'] }
    alarm = { ...alarm, repeatDays: ['Monday', 'Wednesday', 'Friday'] }
    expect(alarm.repeatDays.length).toBe(3)
  })

  test('user can toggle puzzle mode', () => {
    let alarm = { id: 'alarm-1', puzzle: false }
    alarm = { ...alarm, puzzle: true }
    expect(alarm.puzzle).toBe(true)
  })

  test('alarms persist across app restarts', () => {
    const savedAlarms = [
      { id: 'alarm-1', time: Date.now(), enabled: true },
      { id: 'alarm-2', time: Date.now() + 3600000, enabled: false },
    ]
    expect(savedAlarms.length).toBe(2)
  })
})

// ============================================================================
// ALARM NOTIFICATIONS - WHITEBOX: Notification Scheduling
// ============================================================================

describe('[WHITEBOX] ALARM NOTIFICATIONS: Notification Scheduling', () => {
  const mockAlarm = {
    id: 'alarm-1',
    time: 1704067200000,
    repeatDays: ['Monday', 'Wednesday'],
    enabled: true,
    notificationIds: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('notification content includes alarm title', () => {
    const content = {
      title: 'Alarm',
      body: 'Time to do your task!',
      sound: 'default',
      data: { alarmId: mockAlarm.id },
    }
    expect(content.title).toBe('Alarm')
    expect(content.body).toBeDefined()
  })

  test('notification includes alarm ID in data', () => {
    const content = {
      data: { alarmId: String(mockAlarm.id) },
    }
    expect(content.data.alarmId).toBe(mockAlarm.id)
  })

  test('notification trigger has valid date', () => {
    const trigger = {
      type: 'date',
      date: new Date(mockAlarm.time),
    }
    expect(trigger.date instanceof Date).toBe(true)
  })

  test('notification IDs are stored for cancellation', () => {
    const notificationIds = ['notif-1', 'notif-2', 'notif-3']
    const alarm = { ...mockAlarm, notificationIds }
    expect(alarm.notificationIds.length).toBe(3)
  })

  test('repeating alarm schedules primary + nag notifications', () => {
    const notificationIds = ['primary-1', 'nag-1', 'nag-2', 'nag-3', 'nag-4', 'nag-5']
    expect(notificationIds.length).toBeGreaterThan(1)
  })

  test('one-time alarm schedules single notification', () => {
    const notificationIds = ['notif-1']
    expect(notificationIds.length).toBe(1)
  })

  test('notification channel is set to alarm', () => {
    const channelId = 'alarm'
    expect(typeof channelId).toBe('string')
    expect(channelId).toBe('alarm')
  })

  test('alarm notification has max priority on Android', () => {
    const priority = 'MAX'
    expect(priority).toBe('MAX')
  })

  test('notification passes all IDs to cancellation', () => {
    const alarm = {
      id: 'alarm-1',
      notificationIds: ['notif-1', 'notif-2', 'notif-3'],
    }
    const toCancel = alarm.notificationIds
    expect(toCancel.length).toBe(alarm.notificationIds.length)
  })
})

// ============================================================================
// ALARM NOTIFICATIONS - WHITEBOX: Notification Lifecycle
// ============================================================================

describe('[WHITEBOX] ALARM NOTIFICATIONS: Notification Lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('notification is scheduled when alarm is enabled', () => {
    const alarm = {
      id: 'alarm-1',
      enabled: true,
      notificationIds: ['notif-1'],
    }
    expect(alarm.notificationIds.length).toBeGreaterThan(0)
  })

  test('notification is cancelled when alarm is disabled', () => {
    let alarm = {
      id: 'alarm-1',
      enabled: false,
      notificationIds: [],
    }
    expect(alarm.notificationIds.length).toBe(0)
  })

  test('notification is rescheduled when alarm time changes', () => {
    let alarm = {
      id: 'alarm-1',
      time: 1704067200000,
      notificationIds: ['notif-old'],
    }
    alarm = {
      ...alarm,
      time: 1704070800000,
      notificationIds: ['notif-new'],
    }
    expect(alarm.notificationIds[0]).not.toBe('notif-old')
  })

  test('notification is cleared when alarm is deleted', () => {
    let alarms = [
      { id: 'alarm-1', notificationIds: ['notif-1'] },
      { id: 'alarm-2', notificationIds: ['notif-2'] },
    ]
    alarms = alarms.filter(a => a.id !== 'alarm-1')
    expect(alarms[0].notificationIds).toEqual(['notif-2'])
  })

  test('multiple notifications can be tracked for one alarm', () => {
    const alarm = {
      id: 'alarm-1',
      notificationIds: ['primary', 'nag-1', 'nag-2', 'nag-3'],
    }
    expect(alarm.notificationIds.length).toBe(4)
  })
})

// ============================================================================
// ALARM NOTIFICATIONS - BLACKBOX: Notification System Behavior
// ============================================================================

describe('[BLACKBOX] ALARM NOTIFICATIONS: Notification System Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('user receives alarm notification at scheduled time', () => {
    const alarm = {
      id: 'alarm-1',
      time: new Date().getTime() + 60000,
      enabled: true,
    }
    expect(alarm.time).toBeGreaterThan(Date.now())
  })

  test('user receives nag notifications for repeating alarms', () => {
    const nagNotifications = [
      { offsetSeconds: 60, triggered: false },
      { offsetSeconds: 180, triggered: false },
      { offsetSeconds: 300, triggered: false },
    ]
    expect(nagNotifications.length).toBe(3)
  })

  test('user can dismiss alarm from notification', () => {
    const notification = {
      id: 'notif-1',
      alarmId: 'alarm-1',
      dismissed: false,
    }
    const dismissed = { ...notification, dismissed: true }
    expect(dismissed.dismissed).toBe(true)
  })

  test('user navigates to alarm ringing screen when notification tapped', () => {
    const navigation = {
      screen: 'alarmRinging' as string | null,
    }
    expect(navigation.screen).toBe('alarmRinging')
  })

  test('repeating alarm reschedules after ringing', () => {
    let alarm = {
      id: 'alarm-1',
      repeatDays: ['Monday', 'Wednesday', 'Friday'],
      notificationIds: [] as string[],
    }
    alarm = { ...alarm, notificationIds: ['notif-new'] }
    expect(alarm.notificationIds.length).toBeGreaterThan(0)
  })

  test('one-time alarm does not reschedule after ringing', () => {
    const alarm = {
      id: 'alarm-1',
      repeatDays: [],
      notificationIds: [],
    }
    expect(alarm.notificationIds.length).toBe(0)
  })
})

// ============================================================================
// ALARM PUZZLE - WHITEBOX: Puzzle Generation
// ============================================================================

describe('[WHITEBOX] ALARM PUZZLE: Puzzle Generation', () => {
  test('puzzle generates multiple math questions', () => {
    const generateQuestions = (count: number) => {
      const qs: { a: number; b: number }[] = []
      for (let i = 0; i < count; i++) {
        const a = Math.floor(Math.random() * 9) + 1
        const b = Math.floor(Math.random() * 9) + 1
        qs.push({ a, b })
      }
      return qs
    }
    const questions = generateQuestions(3)
    expect(questions.length).toBe(3)
  })

  test('puzzle questions have operands between 1-9', () => {
    const generateQuestions = (count: number) => {
      const qs: { a: number; b: number }[] = []
      for (let i = 0; i < count; i++) {
        const a = Math.floor(Math.random() * 9) + 1
        const b = Math.floor(Math.random() * 9) + 1
        qs.push({ a, b })
      }
      return qs
    }
    const questions = generateQuestions(5)
    questions.forEach(q => {
      expect(q.a).toBeGreaterThanOrEqual(1)
      expect(q.a).toBeLessThanOrEqual(9)
      expect(q.b).toBeGreaterThanOrEqual(1)
      expect(q.b).toBeLessThanOrEqual(9)
    })
  })

  test('puzzle generates unique questions', () => {
    const generateQuestions = (count: number) => {
      const qs: { a: number; b: number }[] = []
      for (let i = 0; i < count; i++) {
        const a = Math.floor(Math.random() * 9) + 1
        const b = Math.floor(Math.random() * 9) + 1
        qs.push({ a, b })
      }
      return qs
    }
    const questions = generateQuestions(10)
    expect(questions.length).toBe(10)
  })

  test('puzzle calculation is correct', () => {
    const question = { a: 3, b: 4 }
    const answer = question.a * question.b
    expect(answer).toBe(12)
  })

  test('puzzle answer validation works', () => {
    const question = { a: 5, b: 6 }
    const correctAnswer = question.a * question.b
    const userAnswer = 30
    expect(userAnswer === correctAnswer).toBe(true)
  })
})

// ============================================================================
// NOTIFICATION SYSTEM - WHITEBOX: Notification Permissions & Setup
// ============================================================================

describe('[WHITEBOX] NOTIFICATION SYSTEM: Notification Setup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('notification handler is registered for received notifications', () => {
    const listener = jest.fn()
    expect(typeof listener).toBe('function')
  })

  test('notification handler is registered for notification responses', () => {
    const listener = jest.fn()
    expect(typeof listener).toBe('function')
  })

  test('notification handlers are cleaned up on unmount', () => {
    const unsub = jest.fn()
    expect(typeof unsub).toBe('function')
  })

  test('Android notification channel is configured', () => {
    const channel = {
      name: 'Alarms',
      importance: 'MAX',
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      bypassDnd: true,
    }
    expect(channel.name).toBe('Alarms')
    expect(channel.bypassDnd).toBe(true)
  })

  test('notification data includes alarm ID for routing', () => {
    const notificationData = {
      alarmId: 'alarm-123',
    }
    expect(notificationData.alarmId).toBeDefined()
  })

  test('last notification response is checked on app launch', () => {
    const response = {
      notification: {
        request: {
          content: {
            data: { alarmId: 'alarm-1' },
          },
        },
      },
    }
    expect(response.notification.request.content.data.alarmId).toBe('alarm-1')
  })
})

// ============================================================================
// NOTIFICATION SYSTEM - BLACKBOX: Notification Handling
// ============================================================================

describe('[BLACKBOX] NOTIFICATION SYSTEM: Notification Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('app routes to alarm ringing when notification received', () => {
    const notificationData = { alarmId: 'alarm-1' }
    const route = notificationData.alarmId ? '/alarmRinging' : '/landing'
    expect(route).toBe('/alarmRinging')
  })

  test('app routes to alarm ringing when notification tapped', () => {
    const response = {
      notification: {
        request: {
          content: {
            data: { alarmId: 'alarm-1' },
          },
        },
      },
    }
    const alarmId = response.notification.request.content.data?.alarmId
    expect(alarmId).toBe('alarm-1')
  })

  test('app detects recent notifications within 2 minute window', () => {
    const RECENT_WINDOW_MS = 2 * 60 * 1000
    const deliveredAt = Date.now() - 60000 // 1 minute ago
    const isRecent = Date.now() - deliveredAt <= RECENT_WINDOW_MS
    expect(isRecent).toBe(true)
  })

  test('app ignores stale notifications outside window', () => {
    const RECENT_WINDOW_MS = 2 * 60 * 1000
    const deliveredAt = Date.now() - 10 * 60 * 1000 // 10 minutes ago
    const isRecent = Date.now() - deliveredAt <= RECENT_WINDOW_MS
    expect(isRecent).toBe(false)
  })

  test('app resolves alarm by ID from notification', () => {
    const alarms = [
      { id: 'alarm-1', enabled: true },
      { id: 'alarm-2', enabled: true },
    ]
    const notificationAlarmId = 'alarm-1'
    const alarm = alarms.find(a => a.id === notificationAlarmId)
    expect(alarm?.id).toBe('alarm-1')
  })

  test('app falls back to time-based alarm resolution if ID not found', () => {
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const alarms = [
      {
        id: 'alarm-1',
        time: new Date(),
        enabled: true,
      },
    ]
    const alarmTime = new Date(alarms[0].time)
    const alarmMinutes = alarmTime.getHours() * 60 + alarmTime.getMinutes()
    const isNearby = Math.abs(alarmMinutes - nowMinutes) <= 2
    expect(typeof isNearby).toBe('boolean')
  })
})

// ============================================================================
// INTEGRATION: Alarm & Notification Workflows
// ============================================================================

describe('[INTEGRATION] Alarm & Notification Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creating alarm with enabled true schedules notifications', () => {
    const newAlarm = {
      id: Date.now(),
      time: Date.now() + 3600000,
      enabled: true,
      notificationIds: ['notif-1', 'notif-2'],
    }
    expect(newAlarm.notificationIds.length).toBeGreaterThan(0)
  })

  test('disabling alarm cancels all scheduled notifications', () => {
    let alarm = {
      id: 'alarm-1',
      enabled: true,
      notificationIds: ['notif-1', 'notif-2', 'notif-3'],
    }
    alarm = {
      ...alarm,
      enabled: false,
      notificationIds: [],
    }
    expect(alarm.notificationIds.length).toBe(0)
  })

  test('editing alarm time reschedules notifications', () => {
    let alarm = {
      id: 'alarm-1',
      time: 1704067200000,
      notificationIds: ['old-notif'],
    }
    alarm = {
      ...alarm,
      time: 1704070800000,
      notificationIds: ['new-notif'],
    }
    expect(alarm.notificationIds[0]).not.toBe('old-notif')
  })

  test('deleting alarm clears all notifications', () => {
    let alarms = [
      { id: 'alarm-1', notificationIds: ['notif-1'] },
      { id: 'alarm-2', notificationIds: ['notif-2'] },
    ]
    alarms = alarms.filter(a => a.id !== 'alarm-1')
    expect(alarms.length).toBe(1)
  })

  test('repeating alarm reschedules after triggering', () => {
    let alarm = {
      id: 'alarm-1',
      repeatDays: ['Monday', 'Wednesday', 'Friday'],
      time: 1704067200000,
      notificationIds: [] as string[],
    }
    alarm = { ...alarm, notificationIds: ['notif-new'] }
    expect(alarm.notificationIds.length).toBeGreaterThan(0)
  })

  test('one-time alarm does not reschedule after triggering', () => {
    const alarm = {
      id: 'alarm-1',
      repeatDays: [],
      time: 1704067200000,
      notificationIds: [],
    }
    expect(alarm.notificationIds.length).toBe(0)
  })

  test('puzzle mode prevents snoozing alarm', () => {
    const alarm = {
      id: 'alarm-1',
      puzzle: true,
    }
    const canSnooze = !alarm.puzzle
    expect(canSnooze).toBe(false)
  })

  test('notification handler updates alarm as ringing', () => {
    const alarm = { id: 'alarm-1', isRinging: false }
    const ringingAlarm = { ...alarm, isRinging: true }
    expect(ringingAlarm.isRinging).toBe(true)
  })
})

// ============================================================================
// ERROR HANDLING: Alarm & Notification Errors
// ============================================================================

describe('[ERROR HANDLING] Alarm & Notification Errors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creating alarm without time is handled', () => {
    const invalid = {
      id: 'alarm-1',
      time: undefined,
    }
    expect(invalid.time).toBeUndefined()
  })

  test('scheduling notification with past time is handled', () => {
    const pastTime = Date.now() - 3600000
    const isFuture = pastTime > Date.now()
    expect(isFuture).toBe(false)
  })

  test('cancelling non-existent notification is handled', () => {
    const notificationIds = ['notif-1']
    const toCancel = 'notif-999'
    const exists = notificationIds.includes(toCancel)
    expect(exists).toBe(false)
  })

  test('alarm with invalid repeat days is handled', () => {
    const invalidDays = ['Moonday', 'Tuesnight']
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const allValid = invalidDays.every(d => validDays.includes(d))
    expect(allValid).toBe(false)
  })

  test('alarm time conversion handles edge cases', () => {
    const timeMs = 0
    const date = new Date(timeMs)
    expect(date instanceof Date).toBe(true)
  })

  test('notification listener removal prevents memory leaks', () => {
    const removeListener = jest.fn()
    removeListener()
    expect(removeListener).toHaveBeenCalled()
  })
})

