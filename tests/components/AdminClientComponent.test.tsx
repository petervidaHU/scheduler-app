/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import AdminClientComponent from "../../app/components/admin/AdminClientComponent";
import enTranslation from "../../app/locales/en/translation";

jest.mock("react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
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

describe("AdminClientComponent", () => {
  test("renders all admin entity cards with provided counts", () => {
    render(
      <MantineProvider>
        <AdminClientComponent
          locale="en"
          counts={{
            classroom: 4,
            class: 9,
            specialty: 3,
            subject: 11,
            teacher: 7,
            frame: 2,
          }}
        />
      </MantineProvider>,
    );

    expect(screen.getByText("Classrooms")).toBeInTheDocument();
    expect(screen.getByText("Classes")).toBeInTheDocument();
    expect(screen.getByText("Specialties")).toBeInTheDocument();
    expect(screen.getByText("Subjects")).toBeInTheDocument();
    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("Frames")).toBeInTheDocument();

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("builds locale-aware create links for each entity", () => {
    render(
      <MantineProvider>
        <AdminClientComponent
          locale="hu"
          counts={{
            classroom: 0,
            class: 0,
            specialty: 0,
            subject: 0,
            teacher: 0,
            frame: 0,
          }}
        />
      </MantineProvider>,
    );

    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));

    expect(hrefs).toContain("/hu/my-tenancy/admin/classroom/new");
    expect(hrefs).toContain("/hu/my-tenancy/admin/class/new");
    expect(hrefs).toContain("/hu/my-tenancy/admin/specialty/new");
    expect(hrefs).toContain("/hu/my-tenancy/admin/subject/new");
    expect(hrefs).toContain("/hu/my-tenancy/admin/teacher/new");
    expect(hrefs).toContain("/hu/my-tenancy/admin/frame/new");
  });
});
