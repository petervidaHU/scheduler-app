import React from "react";
import { NoRoleContent } from "./NoRoleContent";
import { getAuth } from "@/app/api/auth/[...nextauth]/getAuth";
import { Container, Title, Text, Card, Group, Button, SimpleGrid, Badge, Box } from '@mantine/core';
import { IconBuilding, IconUsers, IconBook, IconChalkboard, IconPlus } from '@tabler/icons-react';
import TabsWithTable from '@/components/TabsWithTable';

export default async function MyTenancyPage() {
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
            My Tenancy Dashboard
          </Title>
          <Text ta="center" c="dimmed" mb="xl">
            Welcome! Here you can manage all aspects of your organization: classes, teachers, classrooms, and more.
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconBuilding size={32} />
                <div>
                  <Text fw={500}>Tenancy ID</Text>
                  <Badge color="blue" variant="light">{tenancyId}</Badge>
                </div>
              </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconUsers size={32} />
                <div>
                  <Text fw={500}>Role</Text>
                  <Badge color="teal" variant="light">{userRole}</Badge>
                </div>
              </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconBook size={32} />
                <div>
                  <Text fw={500}>Manage Classes</Text>
                  <Button component="a" href="/classes" size="xs" mt="xs" leftSection={<IconPlus size={16} />}>Add</Button>
                </div>
              </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconChalkboard size={32} />
                <div>
                  <Text fw={500}>Manage Teachers</Text>
                  <Button component="a" href="/teachers" size="xs" mt="xs" leftSection={<IconPlus size={16} />}>Add</Button>
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
