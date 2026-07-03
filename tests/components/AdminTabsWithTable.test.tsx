/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import AdminTabsWithTable from "../../app/components/admin/AdminTabsWithTable";
import enTranslation from "../../app/locales/en/translation";

const mockSubmit = jest.fn();

jest.mock("react-router", () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  Form: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
  useSubmit: () => mockSubmit,
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

const sampleData = {
  specialty: {
    headers: ["Id", "Name", "Code"],
    rows: [{ id: "sp-1", cells: ["sp-1", "STEM", "ST"] }],
  },
  subject: {
    headers: ["Id", "Name", "Code", "Specialty"],
    rows: [{ id: "sub-1", cells: ["sub-1", "Math", "MTH", "STEM"] }],
  },
  teacher: {
    headers: ["Id", "Name", "Email", "Code"],
    rows: [{ id: "t-1", cells: ["t-1", "Jane Doe", "jane@x.com", "JD"] }],
  },
  classroom: {
    headers: ["Id", "Name", "Capacity"],
    rows: [{ id: "c-1", cells: ["c-1", "Room A", 20] }],
  },
  class: {
    headers: ["Id", "Name", "Code", "Specialty", "Teacher", "Classroom"],
    rows: [{ id: "cl-1", cells: ["cl-1", "10A", "10A", "STEM", "Jane", "Room A"] }],
  },
  frame: {
    headers: ["Id", "Name", "Start", "End"],
    rows: [{ id: "f-1", cells: ["f-1", "Spring", "2026-02-01", "2026-06-30"] }],
  },
};

const emptyData = {
  specialty: { headers: ["Id", "Name", "Code"], rows: [] },
  subject: { headers: ["Id", "Name", "Code", "Specialty"], rows: [] },
  teacher: { headers: ["Id", "Name", "Email", "Code"], rows: [] },
  classroom: { headers: ["Id", "Name", "Capacity"], rows: [] },
  class: {
    headers: ["Id", "Name", "Code", "Specialty", "Teacher", "Classroom"],
    rows: [],
  },
  frame: { headers: ["Id", "Name", "Start", "End"], rows: [] },
};

describe("AdminTabsWithTable", () => {
  beforeEach(() => {
    mockSubmit.mockReset();
  });

  test("renders tabs and row actions with locale-aware edit links", () => {
    render(
      <MantineProvider>
        <AdminTabsWithTable locale="en" data={sampleData} />
      </MantineProvider>,
    );

    expect(screen.getByRole("tab", { name: "Specialties" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Subjects" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Frames" })).toBeInTheDocument();

    const editLink = screen.getByRole("link", { name: "Edit Specialty: STEM" });
    expect(editLink).toHaveAttribute("href", "/en/my-tenancy/admin/specialty/sp-1/edit");

    expect(
      screen.getByRole("button", { name: "Delete Specialty: STEM" }),
    ).toBeInTheDocument();
  });

  test("delete asks for confirmation before submitting", async () => {
    render(
      <MantineProvider>
        <AdminTabsWithTable locale="en" data={sampleData} />
      </MantineProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete Specialty: STEM" }));

    // Nothing submitted yet — a confirmation dialog opens instead.
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Delete STEM?")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

    expect(mockSubmit).toHaveBeenCalledWith(
      { intent: "deleteEntity", entity: "specialty", entityId: "sp-1" },
      { method: "post" },
    );
  });

  test("cancelling the confirmation does not submit", async () => {
    render(
      <MantineProvider>
        <AdminTabsWithTable locale="en" data={sampleData} />
      </MantineProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete Specialty: STEM" }));
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(mockSubmit).not.toHaveBeenCalled());
  });

  test("renders empty-state when section has no rows", () => {
    render(
      <MantineProvider>
        <AdminTabsWithTable locale="hu" data={emptyData} />
      </MantineProvider>,
    );

    expect(screen.getAllByText("No records found yet.")).toHaveLength(6);
  });
});
