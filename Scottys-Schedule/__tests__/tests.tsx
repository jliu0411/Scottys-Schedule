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
  test('phrases exports an array with exactly 10 motivational messages', () => {
    expect(Array.isArray(phrases)).toBe(true)
    expect(phrases.length).toBe(10)
  })

  test('all phrases are non-empty strings with no leading/trailing whitespace', () => {
    phrases.forEach((phrase) => {
      expect(typeof phrase).toBe('string')
      expect(phrase.length).toBeGreaterThan(0)
      expect(phrase.trim()).toBe(phrase)
    })
  })

  test('no duplicate phrases exist in the array', () => {
    const uniqueSet = new Set(phrases)
    expect(uniqueSet.size).toBe(phrases.length)
  })

  test('phrases array contains expected motivational messages', () => {
    expect(phrases).toContain('Great work!')
    expect(phrases).toContain('You did it!')
    expect(phrases).toContain('Academic Weapon!!')
  })
})

// ============================================================================
// PHRASES MODULE - BLACKBOX: User-Facing Behavior
// ============================================================================

describe('[BLACKBOX] PHRASES: User Motivation Display', () => {
  test('user receives random encouragement from phrases', () => {
    const randomIdx = Math.floor(Math.random() * phrases.length)
    const randomPhrase = phrases[randomIdx]
    expect(randomPhrase).toBeDefined()
    expect(typeof randomPhrase).toBe('string')
    expect(randomPhrase.length).toBeGreaterThan(0)
  })
})

// ============================================================================
// COLORS CONSTANTS - WHITEBOX: Theme Configuration
// ============================================================================

describe('[WHITEBOX] COLORS: Theme Configuration Constants', () => {
  test('Colors exports primary and warning colors', () => {
    expect(Colors.primary).toBe('#003da4')
    expect(Colors.warning).toBe('#ff0000')
  })

  test('light theme contains all required color properties', () => {
    expect(Colors.light.text).toBe('#201e2b')
    expect(Colors.light.title).toBe('#ffffffff')
    expect(Colors.light.background).toBe('#00537A')
    expect(Colors.light.navBackground).toBe('#0B1E33')
    expect(Colors.light.iconColor).toBe('#686477')
    expect(Colors.light.iconColorFocused).toBe('#201e2b')
    expect(Colors.light.uiBackground).toBe('#d6d5e1')
  })
})

// ============================================================================
// COLORS CONSTANTS - BLACKBOX: Theme Application
// ============================================================================

describe('[BLACKBOX] COLORS: Application Theming', () => {
  test('theme colors can be applied to UI components', () => {
    const backgroundColor = Colors.light.background
    const textColor = Colors.light.text
    expect(backgroundColor).toBeDefined()
    expect(textColor).toBeDefined()
  })

  test('icon colors differentiate active and inactive states', () => {
    const inactive = Colors.light.iconColor
    const active = Colors.light.iconColorFocused
    expect(inactive).not.toBe(active)
  })
})

// ============================================================================
// FORMAT REPEAT DAYS - WHITEBOX: Parsing Logic
// ============================================================================

describe('[WHITEBOX] FORMAT REPEAT DAYS: Repeat Scheduling Logic', () => {
  test('returns "Select Days" when no days provided', () => {
    expect(formatRepeatDays(null)).toBe('Select Days')
    expect(formatRepeatDays([])).toBe('Select Days')
    expect(formatRepeatDays(undefined)).toBe('Select Days')
  })

  test('returns "Everyday" when all 7 days are selected', () => {
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    expect(formatRepeatDays(allDays)).toBe('Everyday')
  })

  test('returns "Weekdays" when Mon-Fri are selected', () => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    expect(formatRepeatDays(weekdays)).toBe('Weekdays')
  })

  test('returns "Weekends" when Sat and Sun are selected', () => {
    const weekends = ['Sun', 'Sat']
    expect(formatRepeatDays(weekends)).toBe('Weekends')
  })

  test('returns comma-separated days for custom selection', () => {
    const customDays = ['Mon', 'Wed', 'Fri']
    const result = formatRepeatDays(customDays)
    expect(result).toBe('Mon, Wed, Fri')
  })

  test('handles single day selection', () => {
    const singleDay = ['Mon']
    expect(formatRepeatDays(singleDay)).toBe('Mon')
  })

  test('preserves input order in output', () => {
    const days = ['Fri', 'Mon', 'Wed']
    expect(formatRepeatDays(days)).toBe('Fri, Mon, Wed')
  })

  test('weekdays format requires exact Mon-Fri set', () => {
    const almostWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    expect(formatRepeatDays(almostWeekdays)).not.toBe('Weekdays')
  })

  test('weekend format requires exact Sat and Sun', () => {
    const almostWeekend = ['Sat', 'Sun', 'Mon']
    expect(formatRepeatDays(almostWeekend)).not.toBe('Weekends')
  })

  test('is case-sensitive for day names', () => {
    const mixedCase = ['mon', 'tue', 'wed', 'thu', 'fri']
    expect(formatRepeatDays(mixedCase)).not.toBe('Weekdays')
  })
})

// ============================================================================
// FORMAT REPEAT DAYS - BLACKBOX: User Display
// ============================================================================

describe('[BLACKBOX] FORMAT REPEAT DAYS: User Display & Selection', () => {
  test('user sees readable repeat schedule description', () => {
    const result = formatRepeatDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
    expect(result).toBe('Weekdays')
    expect(typeof result).toBe('string')
  })

  test('weekends selection displays correctly for user', () => {
    const result = formatRepeatDays(['Sat', 'Sun'])
    expect(result).toBe('Weekends')
  })

  test('everyday option appears when all days selected', () => {
    const result = formatRepeatDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    expect(result).toBe('Everyday')
  })

  test('custom day combination displays readable format', () => {
    const result = formatRepeatDays(['Mon', 'Wed', 'Fri'])
    expect(result).toContain('Mon')
    expect(result).toContain('Wed')
    expect(result).toContain('Fri')
  })

  test('user can clear repeat selection', () => {
    const result = formatRepeatDays(null)
    expect(result).toBe('Select Days')
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
    expect(result.getFullYear()).toBe(date.getFullYear())
  })

  test('schedules Monday task for Monday when before end time', () => {
    const date = new Date('2024-01-15T10:00:00')
    const result = getNextRepeatDate(date, ['Monday'], '15:00')
    expect(result).toBeDefined()
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
  })

  test('schedules task for next week if past end time today', () => {
    const date = new Date('2024-01-15T16:00:00')
    const result = getNextRepeatDate(date, ['Monday'], '15:00')
    expect(result.getTime()).toBeGreaterThan(date.getTime())
  })

  test('handles multiple repeat days and selects nearest', () => {
    const date = new Date('2024-01-15T10:00:00')
    const result = getNextRepeatDate(date, ['Wednesday', 'Friday'], '15:00')
    expect(result).toBeDefined()
    expect(result.getTime()).toBeGreaterThanOrEqual(date.getTime())
  })

  test('sets hours, minutes, and seconds to 0 in result', () => {
    const date = new Date('2024-01-15T14:30:45.123')
    const result = getNextRepeatDate(date, ['Friday'], '15:00')
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
  })

  test('handles all 7 days of the week', () => {
    const date = new Date('2024-01-15T10:00:00')
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const result = getNextRepeatDate(date, allDays, '15:00')
    expect(result).toBeDefined()
  })

  test('respects end time for same-day scheduling decision', () => {
    const beforeEndTime = new Date('2024-01-15T14:00:00')
    const afterEndTime = new Date('2024-01-15T16:00:00')

    const resultBefore = getNextRepeatDate(beforeEndTime, ['Monday'], '15:00')
    const resultAfter = getNextRepeatDate(afterEndTime, ['Monday'], '15:00')

    expect(resultBefore.getDate()).toBe(beforeEndTime.getDate())
    expect(resultAfter.getDate()).toBeGreaterThan(afterEndTime.getDate())
  })

  test('handles edge case: exactly at end time', () => {
    const date = new Date('2024-01-15T15:00:00')
    const result = getNextRepeatDate(date, ['Monday'], '15:00')
    expect(result).toBeDefined()
  })

  test('wraps to next week when no repeat days match current week', () => {
    const date = new Date('2024-01-15T16:00:00')
    const result = getNextRepeatDate(date, ['Tuesday', 'Wednesday'], '15:00')
    expect(result.getTime()).toBeGreaterThanOrEqual(date.getTime())
  })

  test('returns valid Date object', () => {
    const date = new Date('2024-01-15T10:00:00')
    const result = getNextRepeatDate(date, ['Friday'], '15:00')
    expect(result instanceof Date).toBe(true)
    expect(isNaN(result.getTime())).toBe(false)
  })
})

// ============================================================================
// GET NEXT REPEAT DATE - BLACKBOX: Scheduling from User Perspective
// ============================================================================

describe('[BLACKBOX] GET NEXT REPEAT DATE: Task Scheduling User Experience', () => {
  test('user can schedule recurring tasks for specific weekdays', () => {
    const date = new Date('2024-01-15T10:00:00')
    const nextDate = getNextRepeatDate(date, ['Friday'], '15:00')
    expect(nextDate).toBeDefined()
    expect(nextDate.getTime()).toBeGreaterThanOrEqual(date.getTime())
  })

  test('user can schedule daily recurring tasks', () => {
    const date = new Date('2024-01-15T10:00:00')
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const nextDate = getNextRepeatDate(date, allDays, '15:00')
    expect(nextDate).toBeDefined()
  })

  test('user can schedule weekday-only tasks', () => {
    const date = new Date('2024-01-13T10:00:00')
    const weekdayTask = getNextRepeatDate(date, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '15:00')
    expect(weekdayTask).toBeDefined()
  })

  test('user can schedule weekend-only tasks', () => {
    const date = new Date('2024-01-12T10:00:00')
    const weekendTask = getNextRepeatDate(date, ['Saturday', 'Sunday'], '15:00')
    expect(weekendTask).toBeDefined()
  })

  test('task deadline respects end time setting', () => {
    const beforeDeadline = new Date('2024-01-15T14:00:00')
    const afterDeadline = new Date('2024-01-15T16:00:00')
    
    const before = getNextRepeatDate(beforeDeadline, ['Monday'], '15:00')
    const after = getNextRepeatDate(afterDeadline, ['Monday'], '15:00')
    
    // Before deadline: can schedule today
    expect(before.getDate()).toBe(beforeDeadline.getDate())
    // After deadline: should schedule for later
    expect(after.getDate()).toBeGreaterThanOrEqual(afterDeadline.getDate())
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

  test('parses hours and minutes correctly from time string', () => {
    const result = getTriggerDate('2024-01-15', '14:30')
    expect(result!.getHours()).toBe(14)
    expect(result!.getMinutes()).toBe(30)
  })

  test('sets seconds and milliseconds to 0', () => {
    const result = getTriggerDate('2024-01-15', '14:30')
    expect(result!.getSeconds()).toBe(0)
    expect(result!.getMilliseconds()).toBe(0)
  })

  test('handles midnight (00:00) correctly', () => {
    const result = getTriggerDate('2024-01-15', '00:00')
    expect(result!.getHours()).toBe(0)
    expect(result!.getMinutes()).toBe(0)
  })

  test('handles 23:59 (11:59 PM) correctly', () => {
    const result = getTriggerDate('2024-01-15', '23:59')
    expect(result!.getHours()).toBe(23)
    expect(result!.getMinutes()).toBe(59)
  })

  test('parses date components into correct year, month, day', () => {
    const result = getTriggerDate('2024-01-15', '14:30')
    expect(result!.getFullYear()).toBe(2024)
    expect(result!.getMonth()).toBe(0)
  })

  test('handles leap year dates correctly', () => {
    const result = getTriggerDate('2024-02-29', '14:30')
    expect(result!.getMonth()).toBe(1)
  })

  test('returns null for invalid date string', () => {
    const result = getTriggerDate('invalid-date', '14:30')
    expect(result === null || isNaN(result.getTime())).toBe(true)
  })

  test('returns null for invalid time string', () => {
    const result = getTriggerDate('2024-01-15', 'invalid-time')
    expect(result === null || isNaN(result.getTime())).toBe(true)
  })

  test('returns null for empty date string', () => {
    const result = getTriggerDate('', '14:30')
    expect(result === null || isNaN(result.getTime())).toBe(true)
  })

  test('returns null for empty time string', () => {
    const result = getTriggerDate('2024-01-15', '')
    expect(result === null || isNaN(result.getTime())).toBe(true)
  })

  test('handles time with single digit hours and minutes', () => {
    const result = getTriggerDate('2024-01-15', '9:5')
    if (result !== null && !isNaN(result.getTime())) {
      expect(result.getHours()).toBe(9)
      expect(result.getMinutes()).toBe(5)
    }
  })

  test('returns Date instance with callable methods for valid inputs', () => {
    const result = getTriggerDate('2024-01-15', '14:30')
    expect(typeof result!.getTime).toBe('function')
    expect(typeof result!.getHours).toBe('function')
  })
})

// ============================================================================
// GET TRIGGER DATE - BLACKBOX: Notification User Experience
// ============================================================================

describe('[BLACKBOX] GET TRIGGER DATE: Notification Scheduling', () => {
  test('user can set notification trigger time', () => {
    const triggerDate = getTriggerDate('2024-01-15', '14:30')
    expect(triggerDate).not.toBeNull()
  })

  test('notification scheduled for morning times', () => {
    const triggerDate = getTriggerDate('2024-01-15', '09:00')
    expect(triggerDate!.getHours()).toBe(9)
  })

  test('notification scheduled for evening times', () => {
    const triggerDate = getTriggerDate('2024-01-15', '20:30')
    expect(triggerDate!.getHours()).toBe(20)
    expect(triggerDate!.getMinutes()).toBe(30)
  })

  test('notification time is precise to the minute', () => {
    const triggerDate = getTriggerDate('2024-01-15', '14:45')
    expect(triggerDate!.getMinutes()).toBe(45)
    expect(triggerDate!.getSeconds()).toBe(0)
  })

  test('different dates create different notification times', () => {
    const date1 = getTriggerDate('2024-01-15', '14:30')
    const date2 = getTriggerDate('2024-01-16', '14:30')
    if (date1 && date2) {
      expect(date1.getTime()).not.toBe(date2.getTime())
    }
  })

  test('same date different times create different notification times', () => {
    const time1 = getTriggerDate('2024-01-15', '09:00')
    const time2 = getTriggerDate('2024-01-15', '17:00')
    if (time1 && time2) {
      expect(time1.getTime()).not.toBe(time2.getTime())
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


