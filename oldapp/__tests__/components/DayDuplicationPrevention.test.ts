import { act } from 'react-dom/test-utils';
import { useStore } from '@/store/store';
import { nanoid } from 'nanoid';

// Mock nanoid to return predictable IDs for testing
jest.mock('nanoid', () => ({
  nanoid: jest.fn()
    .mockReturnValueOnce('day-1')
    .mockReturnValueOnce('day-2')
    .mockReturnValueOnce('day-3')
}));

describe('Day Duplication Prevention', () => {
  beforeEach(() => {
    // Reset the store state before each test
    act(() => {
      useStore.getState().resetScheduleState();
    });
  });
  
  test('should not add day with duplicate ID', () => {
    // Create two days with the same ID
    const day1 = {
      id: 'duplicate-id',
      order: '1',
      identifier: 'Day 1',
      timeSlots: [],
      lessons: [],
      templateId: undefined
    };
    
    const day2 = {
      id: 'duplicate-id', // Same ID!
      order: '2',
      identifier: 'Day 2',
      timeSlots: [],
      lessons: [],
      templateId: undefined
    };
    
    // Add both days
    act(() => {
      useStore.getState().addDay(day1);
      useStore.getState().addDay(day2);
    });
    
    // Verify only one day was added
    const state = useStore.getState();
    expect(state.scheduleState.days).toHaveLength(1);
    expect(state.scheduleState.days[0].order).toBe('1');
    expect(state.scheduleState.days[0].identifier).toBe('Day 1');
  });
  
  test('should create unique days with updateDaysBasedOnFrame', () => {
    // Create a function similar to the one in the component
    const updateDaysBasedOnFrame = (numberOfDays: number) => {
      // Mock implementation of updateDaysBasedOnFrame
      const { deleteDay, addDay } = useStore.getState();
      
      // Clear existing days
      useStore.getState().scheduleState.days.forEach(day => {
        deleteDay(day.id);
      });
      
      // Create new days
      for (let i = 0; i < numberOfDays; i++) {
        const newDay = {
          id: nanoid(),
          order: String(i + 1),
          identifier: `Day ${i + 1}`,
          timeSlots: [],
          lessons: [],
          templateId: undefined
        };
        addDay(newDay);
      }
    };
    
    // Call the function to create days
    act(() => {
      updateDaysBasedOnFrame(3);
    });
    
    // Verify days were created with unique IDs
    const state = useStore.getState();
    expect(state.scheduleState.days).toHaveLength(3);
    expect(state.scheduleState.days[0].id).toBe('day-1');
    expect(state.scheduleState.days[1].id).toBe('day-2');
    expect(state.scheduleState.days[2].id).toBe('day-3');
    
    // Verify days have correct order and identifier
    expect(state.scheduleState.days[0].order).toBe('1');
    expect(state.scheduleState.days[0].identifier).toBe('Day 1');
    expect(state.scheduleState.days[1].order).toBe('2');
    expect(state.scheduleState.days[1].identifier).toBe('Day 2');
    expect(state.scheduleState.days[2].order).toBe('3');
    expect(state.scheduleState.days[2].identifier).toBe('Day 3');
  });
}); 