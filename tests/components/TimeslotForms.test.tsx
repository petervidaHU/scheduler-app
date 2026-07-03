/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import TimeslotForms from "../../app/components/forms/TimeslotForms";
import enTranslation from "../../app/locales/en/translation";

const submitMock = jest.fn();

jest.mock("react-router", () => ({
  useSubmit: () => submitMock,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      const value = key
        .split(".")
        .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], enTranslation);
      if (typeof value !== "string") return key;
      return value.replace(/\{\{(\w+)\}\}/g, (_, name) => options?.[name] ?? "");
    },
  }),
}));

describe("TimeslotForms", () => {
  beforeEach(() => {
    submitMock.mockReset();
  });

  function renderComponent() {
    render(
      <MantineProvider>
        <TimeslotForms
          options={{
            frames: [{ value: "frame-1", label: "Frame 1" }],
            subjects: [{ value: "subject-1", label: "Math" }],
            teachers: [{ value: "teacher-1", label: "Jane Doe" }],
            classrooms: [{ value: "classroom-1", label: "Room A" }],
            classes: [{ value: "class-1", label: "Class A" }],
          }}
          timeslots={[
            {
              id: "ts-1",
              frameId: "frame-1",
              frameName: "Frame 1",
              dayOfWeek: 2,
              startMinute: 480,
              endMinute: 525,
              subjectId: "subject-1",
              teacherId: "teacher-1",
              classroomId: "classroom-1",
              classId: "class-1",
            },
          ]}
        />
      </MantineProvider>,
    );
  }

  function assertSubmitPayload(expectedIntent: string, expectedMode?: string) {
    expect(submitMock).toHaveBeenCalledTimes(1);
    const [formData] = submitMock.mock.calls[0];
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get("intent")).toBe(expectedIntent);
    if (expectedMode) {
      expect((formData as FormData).get("mode")).toBe(expectedMode);
    }
  }

  test("submits create single intent from default tab", () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: "Create timeslot" }));

    assertSubmitPayload("create", "single");
  });

  test("submits create template intent from template tab", () => {
    renderComponent();

    fireEvent.click(screen.getByRole("tab", { name: "Timeslot template" }));
    fireEvent.click(screen.getByRole("button", { name: "Create template timeslots" }));

    assertSubmitPayload("create", "template");
  });

  test("submits update intent from edit tab", () => {
    renderComponent();

    fireEvent.click(screen.getByRole("tab", { name: "Edit timeslot" }));
    fireEvent.click(screen.getByRole("button", { name: "Update timeslot" }));

    assertSubmitPayload("update");
  });
});
