import { act } from 'react-dom/test-utils';
import { useStore } from '@/store/store';
import { nanoid } from 'nanoid';

// Mock nanoid to return predictable IDs for testing
jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('test-id-123')
}));

describe('Schedule Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    act(() => {
      useStore.getState().resetScheduleState();
    });
  });

  test('initial state should be correctly set', () => {
    const state = useStore.getState();
    
    // Check initial schedule state
    expect(state.scheduleState).toEqual({
      id: "",
      status: null,
      name: null,
      class: null,
      description: null,
      owner: null,
      frameId: null,
      lessons: {},
      days: [],
    });

    // Check empty syllabus
    expect(state.syllabus).toEqual({});

    // Check empty active timeslots
    expect(state.activeTimeslots).toEqual({});
  });

  test('resetScheduleState should clear state correctly', () => {
    // First, set some data
    act(() => {
      useStore.getState().updateSchedule({ 
        name: 'Test Schedule',
        class: 123,
        description: 'Test Description'
      });
    });

    // Add a day
    act(() => {
      useStore.getState().addDay({
        id: 'day-1',
        order: '1',
        identifier: 'Day 1',
        timeSlots: [],
        lessons: []
      });
    });

    // Verify data was set
    let state = useStore.getState();
    expect(state.scheduleState.name).toBe('Test Schedule');
    expect(state.scheduleState.days.length).toBe(1);

    // Reset state
    act(() => {
      state.resetScheduleState();
    });

    // Verify state was reset
    state = useStore.getState();
    expect(state.scheduleState.name).toBeNull();
    expect(state.scheduleState.days).toEqual([]);
    expect(state.syllabus).toEqual({});
    expect(state.activeTimeslots).toEqual({});
  });

  test('addDay should add a day to the schedule', () => {
    const newDay = {
      id: 'day-1',
      order: '1',
      identifier: 'Day 1',
      timeSlots: [],
      lessons: [],
      templateId: undefined
    };

    act(() => {
      useStore.getState().addDay(newDay);
    });

    const state = useStore.getState();
    expect(state.scheduleState.days).toHaveLength(1);
    expect(state.scheduleState.days[0]).toEqual(newDay);
  });

  test('addDay should prevent duplicate day IDs', () => {
    const day = {
      id: 'day-1',
      order: '1',
      identifier: 'Day 1',
      timeSlots: [],
      lessons: [],
      templateId: undefined
    };

    // Add the same day twice
    act(() => {
      useStore.getState().addDay(day);
      useStore.getState().addDay(day);
    });

    // Should only have one day
    const state = useStore.getState();
    expect(state.scheduleState.days).toHaveLength(1);
  });

  test('deleteDay should remove a day from the schedule', () => {
    // Add a day
    act(() => {
      useStore.getState().addDay({
        id: 'day-to-delete',
        order: '1',
        identifier: 'Day 1',
        timeSlots: [],
        lessons: [],
        templateId: undefined
      });
    });

    // Verify day was added
    let state = useStore.getState();
    expect(state.scheduleState.days).toHaveLength(1);

    // Delete the day
    act(() => {
      useStore.getState().deleteDay('day-to-delete');
    });

    // Verify day was removed
    state = useStore.getState();
    expect(state.scheduleState.days).toHaveLength(0);
  });

  test('updateSchedule should update schedule properties', () => {
    act(() => {
      useStore.getState().updateSchedule({ 
        name: 'Updated Schedule',
        description: 'Updated Description',
        class: 456
      });
    });

    const state = useStore.getState();
    expect(state.scheduleState.name).toBe('Updated Schedule');
    expect(state.scheduleState.description).toBe('Updated Description');
    expect(state.scheduleState.class).toBe(456);
  });

  test('updateSyllabus should update the syllabus data', () => {
    const testSyllabus = { 
      123: { 
        value: '123', 
        label: 'Math',
        SUBJECT_ID: 123,
        CLASS_ID: 456,
        TEACHERS: [789]
      } 
    };

    act(() => {
      useStore.getState().updateSyllabus(testSyllabus);
    });

    const state = useStore.getState();
    expect(state.syllabus).toEqual(testSyllabus);
  });

  test('deleteOneLesson should remove a lesson and update related timeslots', () => {
    // Setup: Add a day with a lesson
    const lessonId = 'lesson-123';
    
    act(() => {
      // Add day with timeslot that references the lesson
      useStore.getState().addDay({
        id: 'day-1',
        order: '1',
        identifier: 'Day 1',
        timeSlots: [{ timeslotId: 1, lessonId }],
        lessons: []
      });
      
      // Add lesson to the store
      useStore.getState().updateSchedule({
        lessons: { [lessonId]: { id: lessonId, subject: 'Math' } }
      });
    });
    
    // Verify setup
    let state = useStore.getState();
    expect(state.scheduleState.lessons[lessonId]).toBeTruthy();
    expect(state.scheduleState.days[0].timeSlots[0].lessonId).toBe(lessonId);
    
    // Delete the lesson
    act(() => {
      useStore.getState().deleteOneLesson(lessonId);
    });
    
    // Verify lesson was removed and timeslot reference cleared
    state = useStore.getState();
    expect(state.scheduleState.lessons[lessonId]).toBeUndefined();
    expect(state.scheduleState.days[0].timeSlots[0].lessonId).toBeUndefined();
  });
}); 