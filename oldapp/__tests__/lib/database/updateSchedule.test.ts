import { updateSchedule } from '@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/updateSchedule';
import { getDbInstance } from '@/lib/database/db-instance';

// Mock the database instance
jest.mock('@/lib/database/db-instance', () => ({
  getDbInstance: jest.fn(),
}));

describe('updateSchedule Error Handling', () => {
  // Mock initial state
  const initialState = {
    error: null,
    data: null,
    success: false,
  };

  // Mock schedule data
  const scheduleData = {
    id: '123',
    name: 'Test Schedule',
    description: 'Test Description',
    frameId: 456,
    class: 789,
    lessons: {},
    days: [
      {
        id: 'day-1',
        timeSlots: [{ timeslotId: 1, lessonId: 'lesson-1' }],
        templateId: undefined
      }
    ],
    owner: 101,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles timeout errors correctly', async () => {
    // Mock database with timeout error
    const mockDb = {
      updateSchedule: jest.fn().mockImplementation(() => {
        const error = new Error('ORA-12170: TNS:Connect timeout occurred');
        error.name = 'Error';
        throw error;
      }),
    };
    (getDbInstance as jest.Mock).mockResolvedValue(mockDb);

    // Call the action
    const result = await updateSchedule(initialState, scheduleData);

    // Verify error was handled
    expect(result.success).toBe(false);
    expect(result.error).toContain('Connection timeout');
    expect(mockDb.updateSchedule).toHaveBeenCalledTimes(3); // Should retry 3 times
  });

  test('handles lock errors correctly', async () => {
    // Mock database with lock error
    const mockDb = {
      updateSchedule: jest.fn().mockImplementation(() => {
        const error = new Error('ORA-00054: resource busy and acquire with NOWAIT specified or timeout expired');
        error.name = 'Error';
        throw error;
      }),
    };
    (getDbInstance as jest.Mock).mockResolvedValue(mockDb);

    // Call the action
    const result = await updateSchedule(initialState, scheduleData);

    // Verify error was handled
    expect(result.success).toBe(false);
    expect(result.error).toContain('resource is locked');
    expect(mockDb.updateSchedule).toHaveBeenCalledTimes(1); // Lock errors aren't retried
  });

  test('handles connection errors correctly', async () => {
    // Mock database with connection error
    const mockDb = {
      updateSchedule: jest.fn().mockImplementation(() => {
        const error = new Error('ORA-12541: TNS:no listener');
        error.name = 'Error';
        throw error;
      }),
    };
    (getDbInstance as jest.Mock).mockResolvedValue(mockDb);

    // Call the action
    const result = await updateSchedule(initialState, scheduleData);

    // Verify error was handled
    expect(result.success).toBe(false);
    expect(result.error).toContain('Database connection error');
    expect(mockDb.updateSchedule).toHaveBeenCalledTimes(3); // Should retry 3 times
  });

  test('handles general database errors correctly', async () => {
    // Mock database with general error
    const mockDb = {
      updateSchedule: jest.fn().mockImplementation(() => {
        const error = new Error('ORA-00001: unique constraint violated');
        error.name = 'Error';
        throw error;
      }),
    };
    (getDbInstance as jest.Mock).mockResolvedValue(mockDb);

    // Call the action
    const result = await updateSchedule(initialState, scheduleData);

    // Verify error was handled
    expect(result.success).toBe(false);
    expect(result.error).toContain('Database error');
    expect(mockDb.updateSchedule).toHaveBeenCalledTimes(1); // General errors aren't retried
  });

  test('handles successful updates', async () => {
    // Mock database with successful update
    const mockDb = {
      updateSchedule: jest.fn().mockResolvedValue({
        success: true,
        data: { id: '123', name: 'Test Schedule' }
      }),
    };
    (getDbInstance as jest.Mock).mockResolvedValue(mockDb);

    // Call the action
    const result = await updateSchedule(initialState, scheduleData);

    // Verify success
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: '123', name: 'Test Schedule' });
    expect(mockDb.updateSchedule).toHaveBeenCalledTimes(1);
  });
}); 