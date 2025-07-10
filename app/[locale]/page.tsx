import { Container, Title, Text, Button, Group, Card, SimpleGrid } from '@mantine/core';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('home');
  return (
    <Container size="lg" py="xl">
      <Title order={1} ta="center" mb="md">
        {t('welcome')}
      </Title>
      <Text ta="center" c="dimmed" mb="xl">
        {t('welcomeText')}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="xs">{t('myTenancyDashboard')}</Title>
          <Text c="dimmed" mb="md">
            {t('dashboardAccess')}
          </Text>
          <Group justify="flex-end">
            <Button component="a" href="/[locale]/my-tenancy" variant="filled" color="blue">
              {t('goToDashboard')}
            </Button>
          </Group>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="xs">{t('quickStart')}</Title>
          <Text c="dimmed" mb="md">
            {t('quickStartText')}
          </Text>
          <Group justify="flex-end">
            <Button component="a" href="/[locale]/(tenancy)/schedules" variant="outline" color="blue">
              {t('createSchedule')}
            </Button>
          </Group>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
