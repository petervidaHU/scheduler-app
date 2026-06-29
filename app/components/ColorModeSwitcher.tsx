import { Button, Group, useMantineColorScheme } from "@mantine/core";

export default function ColorModeSwitcher() {
  const { setColorScheme, clearColorScheme } = useMantineColorScheme();

  return (
    <Group gap="xs">
      <Button variant="subtle" size="xs" onClick={() => setColorScheme("light")}>
        Light
      </Button>
      <Button variant="subtle" size="xs" onClick={() => setColorScheme("dark")}>
        Dark
      </Button>
      <Button variant="subtle" size="xs" onClick={() => setColorScheme("auto")}>
        Auto
      </Button>
      <Button variant="subtle" size="xs" onClick={clearColorScheme}>
        Clear
      </Button>
    </Group>
  );
}