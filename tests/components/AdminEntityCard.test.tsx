/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import AdminEntityCard from "../../app/components/admin/AdminEntityCard";
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

describe("AdminEntityCard", () => {
  test("renders plural title, count and create link", () => {
    render(
      <MantineProvider>
        <AdminEntityCard
          kind="teacher"
          pluralLabelKey="nav.teachers"
          count={12}
          createTo="/en/my-tenancy/admin?entity=teacher"
        />
      </MantineProvider>,
    );

    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    const createLink = screen.getByRole("link", { name: "Create Teacher" });
    expect(createLink).toHaveAttribute("href", "/en/my-tenancy/admin?entity=teacher");
  });
});
