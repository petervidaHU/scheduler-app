/**
 * @jest-environment jsdom
 */

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider, useMantineColorScheme } from "@mantine/core";
import ColorModeSwitcher from "../../app/components/ColorModeSwitcher";

jest.mock("@mantine/core", () => {
  const actual = jest.requireActual("@mantine/core");
  return {
    ...actual,
    useMantineColorScheme: jest.fn(),
  };
});

const mockedUseMantineColorScheme = useMantineColorScheme as jest.MockedFunction<
  typeof useMantineColorScheme
>;

describe("ColorModeSwitcher", () => {
  beforeEach(() => {
    mockedUseMantineColorScheme.mockReset();
  });

  test("renders all mode controls", () => {
    mockedUseMantineColorScheme.mockReturnValue({
      colorScheme: "auto",
      setColorScheme: jest.fn(),
      clearColorScheme: jest.fn(),
      toggleColorScheme: jest.fn(),
    });

    render(
      <MantineProvider>
        <ColorModeSwitcher />
      </MantineProvider>
    );

    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Auto" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  test("invokes setColorScheme and clearColorScheme on clicks", () => {
    const setColorScheme = jest.fn();
    const clearColorScheme = jest.fn();

    mockedUseMantineColorScheme.mockReturnValue({
      colorScheme: "auto",
      setColorScheme,
      clearColorScheme,
      toggleColorScheme: jest.fn(),
    });

    render(
      <MantineProvider>
        <ColorModeSwitcher />
      </MantineProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    fireEvent.click(screen.getByRole("button", { name: "Auto" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(setColorScheme).toHaveBeenNthCalledWith(1, "light");
    expect(setColorScheme).toHaveBeenNthCalledWith(2, "dark");
    expect(setColorScheme).toHaveBeenNthCalledWith(3, "auto");
    expect(clearColorScheme).toHaveBeenCalledTimes(1);
  });
});