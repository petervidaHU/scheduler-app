/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider, useMantineColorScheme } from "@mantine/core";
import { ColorSchemeToggle } from "../../app/ui/ColorSchemeToggle";

jest.mock("@mantine/core", () => {
  const actual = jest.requireActual("@mantine/core");
  return {
    ...actual,
    useMantineColorScheme: jest.fn(),
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockedUseMantineColorScheme = useMantineColorScheme as jest.MockedFunction<
  typeof useMantineColorScheme
>;

function renderToggle() {
  return render(
    <MantineProvider>
      <ColorSchemeToggle />
    </MantineProvider>,
  );
}

describe("ColorSchemeToggle", () => {
  beforeEach(() => {
    mockedUseMantineColorScheme.mockReset();
    mockedUseMantineColorScheme.mockReturnValue({
      colorScheme: "auto",
      setColorScheme: jest.fn(),
      clearColorScheme: jest.fn(),
      toggleColorScheme: jest.fn(),
    });
  });

  test("renders a single labeled toggle button", () => {
    renderToggle();

    expect(screen.getByRole("button", { name: "ui.colorScheme" })).toBeInTheDocument();
  });

  test.each([
    ["ui.lightMode", "light"],
    ["ui.darkMode", "dark"],
    ["ui.autoMode", "auto"],
  ])("selecting %s sets the %s scheme", async (itemName, scheme) => {
    const setColorScheme = jest.fn();
    mockedUseMantineColorScheme.mockReturnValue({
      colorScheme: "auto",
      setColorScheme,
      clearColorScheme: jest.fn(),
      toggleColorScheme: jest.fn(),
    });

    const { unmount } = renderToggle();

    fireEvent.click(screen.getByRole("button", { name: "ui.colorScheme" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: itemName }));
    expect(setColorScheme).toHaveBeenLastCalledWith(scheme);

    unmount();
  });

  test("marks the active scheme in the menu", async () => {
    mockedUseMantineColorScheme.mockReturnValue({
      colorScheme: "dark",
      setColorScheme: jest.fn(),
      clearColorScheme: jest.fn(),
      toggleColorScheme: jest.fn(),
    });

    renderToggle();

    fireEvent.click(screen.getByRole("button", { name: "ui.colorScheme" }));
    expect(await screen.findByRole("menuitem", { name: "ui.darkMode" })).toHaveAttribute(
      "data-active",
    );
  });
});
