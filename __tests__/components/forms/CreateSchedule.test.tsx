import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateSchedule from '@/components/forms/CreateSchedule';
import { useStore } from '@/store/store';
import * as getSyllabusActionModule from '@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getSyllabusAction';

// Mock the server action modules
jest.mock('@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/createSchedule', () => ({
  createSchedule: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
}));

jest.mock('@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/updateSchedule', () => ({
  updateSchedule: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
}));

jest.mock('@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getScheduleById', () => ({
  getScheduleById: jest.fn().mockImplementation(() => Promise.resolve({
    id: '123',
    name: 'Test Schedule',
    class: 456,
    description: 'Test Description',
    days: [],
    lessons: {},
  })),
}));

jest.mock('@/app/[locale]/(tenancy)/my-tenancy/schedules/_actions/getSyllabusAction', () => ({
  getSyllabusAction: jest.fn().mockImplementation(() => Promise.resolve({
    123: {
      value: '123',
      label: 'Math',
      SUBJECT_ID: 123,
      CLASS_ID: 456,
      TEACHERS: [789],
    },
  })),
}));

jest.mock('@/lib/hooks/useFormResponse', () => ({
  useTenancyBasedFormResponse: jest.fn(),
}));

// Mock the Zustand store
jest.mock('@/store/store', () => ({
  useStore: jest.fn(),
}));

// Mock component
jest.mock('@mantine/form', () => ({
  useForm: () => ({
    values: {
      name: 'Test Schedule',
      class: '456',
      description: 'Test Description',
      frameId: '789',
    },
    getInputProps: jest.fn().mockReturnValue({}),
    setValues: jest.fn(),
    setFieldValue: jest.fn(),
    onSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.();
      return fn({
        name: 'Test Schedule',
        class: '456',
        description: 'Test Description',
        frameId: '789',
      });
    },
  }),
}));

describe('CreateSchedule Component', () => {
  // Setup mock store data
  const mockStore = {
    tenancyBasedData: {
      teachers: { data: {} },
      classes: { 
        data: {
          456: {
            ID: 456,
            NAME: 'Class 456',
            NUMBER_OF_STUDENTS: 25,
          }
        }
      },
      classRooms: { data: {} },
      subjects: { data: {} },
      frames: { 
        data: {
          789: {
            ID: 789,
            NAME: 'Frame 789',
            NUMBER_OF_DAYS: 5,
            RECURRENCE: 1,
          }
        }
      },
    },
    scheduleState: {
      days: [],
      lessons: {},
    },
    addDay: jest.fn(),
    deleteDay: jest.fn(),
    updateSyllabus: jest.fn(),
    updateSchedule: jest.fn(),
    resetScheduleState: jest.fn(),
    syllabus: {},
    activeTimeslots: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStore as jest.Mock).mockImplementation(() => mockStore);
  });

  test('renders CreateSchedule component for new schedule', async () => {
    render(<CreateSchedule />);
    
    expect(screen.getByText('Schedule Details')).toBeInTheDocument();
    expect(screen.getByText('Create Schedule')).toBeInTheDocument();
  });

  test('initializes with scheduleData when editing', async () => {
    const scheduleData = {
      id: '123',
      name: 'Edit Test Schedule',
      class: 456,
      description: 'Edit Test Description',
      owner: 789,
      status: 'DRAFT',
      frameId: '789',
      days: [],
      lessons: {},
    };

    const syllabusData = {
      123: {
        value: '123',
        label: 'Math',
        SUBJECT_ID: 123,
        CLASS_ID: 456,
        TEACHERS: [789],
      },
    };

    render(
      <CreateSchedule 
        scheduleId="123" 
        scheduleData={scheduleData} 
        syllabusData={syllabusData} 
      />
    );

    await waitFor(() => {
      // Check that store methods were called
      expect(mockStore.updateSchedule).toHaveBeenCalledWith(expect.objectContaining({
        id: '123',
        name: 'Edit Test Schedule',
      }));

      expect(mockStore.updateSyllabus).toHaveBeenCalledWith(syllabusData);
    });

    expect(screen.getByText('Update Schedule')).toBeInTheDocument();
  });

  test('calls getSyllabusAction when class value changes', async () => {
    const getSyllabusActionSpy = jest.spyOn(getSyllabusActionModule, 'getSyllabusAction');
    
    render(<CreateSchedule />);
    
    // This simulates the onValuesChange callback execution
    // The actual implementation depends on how your form handles value changes
    const form = (useStore as jest.Mock).mock.calls[0][0].onValuesChange?.(
      { class: '789', name: '' }, 
      { class: '', name: '' }
    );
    
    await waitFor(() => {
      expect(getSyllabusActionSpy).toHaveBeenCalledWith(789);
    });
  });

  test('resets state on unmount', async () => {
    const { unmount } = render(<CreateSchedule />);
    unmount();
    
    expect(mockStore.resetScheduleState).toHaveBeenCalled();
  });
}); 