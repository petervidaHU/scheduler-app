import React from "react";
import { NoRoleContent } from "./NoRoleContent";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { Container, Title, Text, Card, Group, Button, SimpleGrid, Badge, Box } from '@mantine/core';
import { IconBuilding, IconUsers, IconBook, IconChalkboard, IconPlus } from '@tabler/icons-react';
import TabsWithTable from '@/components/TabsWithTable';
import { getTranslations } from 'next-intl/server';

export default async function MyTenancyPage() {
  const t = await getTranslations('dashboard');
  const { tenancyId, userRole } = await getAuth();

  if (!userRole || userRole === 'norole') {
    return <NoRoleContent tenancyId={tenancyId?.toString() || ''} />;
  }

  return (
    <>
      {/* Ensure secondary navbar sits below the main header */}
      <Box style={{ position: 'relative', zIndex: 1 }}>
        <Container size="lg" py="xl">
          <Title order={1} ta="center" mb="md">
            {t('myTenancyDashboard')}
          </Title>
          <Text ta="center" c="dimmed" mb="xl">
            {t('welcomeDashboard')}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconBuilding size={32} />
                <div>
                  <Text fw={500}>{t('tenancyId')}</Text>
                  <Badge color="blue" variant="light">{tenancyId}</Badge>
                </div>
              </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconUsers size={32} />
                <div>
                  <Text fw={500}>{t('role')}</Text>
                  <Badge color="teal" variant="light">{userRole}</Badge>
                </div>
              </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconBook size={32} />
                <div>
                  <Text fw={500}>{t('manageClasses')}</Text>
                  <Button component="a" href="/classes" size="xs" mt="xs" leftSection={<IconPlus size={16} />}>{t('add')}</Button>
                </div>
              </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconChalkboard size={32} />
                <div>
                  <Text fw={500}>{t('manageTeachers')}</Text>
                  <Button component="a" href="/teachers" size="xs" mt="xs" leftSection={<IconPlus size={16} />}>{t('add')}</Button>
                </div>
              </Group>
            </Card>
          </SimpleGrid>
          {/* Secondary navbar (TabsWithTable) placed below the dashboard header/cards */}
          <Box mt="md">
            <TabsWithTable />
          </Box>
        </Container>
      </Box>
    </>
  );
}
