import { Container, Title, Text, Button, Group, Card, SimpleGrid } from '@mantine/core';

export default function Home() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} ta="center" mb="md">
        Welcome to Scheduler App
      </Title>
      <Text ta="center" c="dimmed" mb="xl">
        Effortlessly manage your lessons, classrooms, and teachers. Get started by creating or viewing your schedules.
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="xs">My Tenancy Dashboard</Title>
          <Text c="dimmed" mb="md">
            Access your dashboard to manage schedules, classrooms, and more for your organization.
          </Text>
          <Group justify="flex-end">
            <Button component="a" href="/[locale]/my-tenancy" variant="filled" color="blue">
              Go to Dashboard
            </Button>
          </Group>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="xs">Quick Start</Title>
          <Text c="dimmed" mb="md">
            Create a new schedule, add classrooms, or invite teachers to your tenancy.
          </Text>
          <Group justify="flex-end">
            <Button component="a" href="/[locale]/(tenancy)/schedules" variant="outline" color="blue">
              Create Schedule
            </Button>
          </Group>
        </Card>
      </SimpleGrid>
      <Group justify="center">
        <Button component="a" href="https://ui.mantine.dev/" target="_blank" variant="subtle" color="gray">
          Explore Mantine UI Components
        </Button>
      </Group>
    </Container>
  );
}
