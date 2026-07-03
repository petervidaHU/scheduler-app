/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { LessonDetailDrawer } from "../../app/components/planner/LessonDetailDrawer";
import enTranslation from "../../app/locales/en/translation";
import type { PlannerEntry } from "../../app/lib/repositories/plannerRepository.server";

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

const entry: PlannerEntry = {
  entryId: "entry-1",
  timeslot: {
    id: "ts-1",
    dayOfWeek: 2,
    startMinute: 480,
    endMinute: 525,
    class: { id: "c1", name: "9.A" },
    subject: { id: "s1", name: "Math" },
    teacher: { id: "t1", name: "Jane Doe" },
    classroom: { id: "r1", name: "Room 204" },
  },
};

function renderDrawer(props: Partial<React.ComponentProps<typeof LessonDetailDrawer>> = {}) {
  const onClose = jest.fn();
  const onRemove = jest.fn();

  const utils = render(
    <MantineProvider>
      <LessonDetailDrawer
        entry={entry}
        hasConflict={false}
        onClose={onClose}
        onRemove={onRemove}
        isRemoving={false}
        {...props}
      />
    </MantineProvider>,
  );

  return { ...utils, onClose, onRemove };
}

describe("LessonDetailDrawer", () => {
  test("renders entity chips for the lesson", () => {
    renderDrawer();

    expect(screen.getByText("Math")).toBeInTheDocument();
    expect(screen.getByText("9.A")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Room 204")).toBeInTheDocument();
  });

  test("shows a conflict alert when hasConflict is true", () => {
    renderDrawer({ hasConflict: true });

    expect(screen.getByText("This lesson overlaps with another one — the same teacher or classroom is booked twice in this slot.")).toBeInTheDocument();
  });

  test("does not remove immediately — requires confirmation first", async () => {
    const { onRemove } = renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Remove lesson" }));

    expect(onRemove).not.toHaveBeenCalled();
    expect(await screen.findByText("Remove this lesson?")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    expect(onRemove).toHaveBeenCalledWith("entry-1");
  });

  test("cancelling the confirmation does not remove", async () => {
    const { onRemove } = renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Remove lesson" }));
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(onRemove).not.toHaveBeenCalled();
  });

  test("confirming remove closes the drawer and calls onRemove with the entry id", async () => {
    const { onRemove, onClose } = renderDrawer();

    fireEvent.click(screen.getByRole("button", { name: "Remove lesson" }));
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    expect(onRemove).toHaveBeenCalledWith("entry-1");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
