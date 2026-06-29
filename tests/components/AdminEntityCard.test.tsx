/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import AdminEntityCard from "../../app/components/admin/AdminEntityCard";

jest.mock("react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("AdminEntityCard", () => {
  test("renders title, description, count and create link", () => {
    render(
      <MantineProvider>
        <AdminEntityCard
          title="Teachers"
          description="Manage teacher records."
          count={12}
          createLabel="Create teacher"
          createTo="/en/my-tenancy/admin?entity=teacher"
        />
      </MantineProvider>
    );

    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("Manage teacher records.")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    const createLink = screen.getByRole("link", { name: "Create teacher" });
    expect(createLink).toHaveAttribute("href", "/en/my-tenancy/admin?entity=teacher");
  });
});