/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { useLocation } from "react-router";
import LocaleSwitcher from "../../app/components/LocaleSwitcher";

jest.mock("react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useLocation: jest.fn(),
}));

const mockedUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe("LocaleSwitcher", () => {
  test("replaces existing locale segment and keeps search/hash", () => {
    mockedUseLocation.mockReturnValue({
      pathname: "/en/my-tenancy/schedules",
      search: "?tab=list",
      hash: "#top",
      key: "k1",
      state: null,
      unstable_mask: undefined,
    });

    render(
      <MantineProvider>
        <LocaleSwitcher locale="en" />
      </MantineProvider>
    );

    const enLink = screen.getByRole("link", { name: "EN" });
    const huLink = screen.getByRole("link", { name: "HU" });

    expect(enLink).toHaveAttribute("href", "/en/my-tenancy/schedules?tab=list#top");
    expect(huLink).toHaveAttribute("href", "/hu/my-tenancy/schedules?tab=list#top");
  });

  test("prepends locale when path has no locale segment", () => {
    mockedUseLocation.mockReturnValue({
      pathname: "/pricing",
      search: "",
      hash: "",
      key: "k2",
      state: null,
      unstable_mask: undefined,
    });

    render(
      <MantineProvider>
        <LocaleSwitcher locale="hu" />
      </MantineProvider>
    );

    const enLink = screen.getByRole("link", { name: "EN" });
    const huLink = screen.getByRole("link", { name: "HU" });

    expect(enLink).toHaveAttribute("href", "/en/pricing");
    expect(huLink).toHaveAttribute("href", "/hu/pricing");
  });
});