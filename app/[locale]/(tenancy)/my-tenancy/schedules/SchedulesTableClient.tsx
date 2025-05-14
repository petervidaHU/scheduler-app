"use client";
import { useState, useMemo } from "react";
import { Card, Button, Group, Badge, TextInput, Select, Table as MantineTable, Title } from "@mantine/core";
import Link from "next/link";

interface Schedule {
  ID: number;
  NAME: string;
  CLASS_ID: number;
  CLASS_NAME?: string;
  OWNER: string;
  STATUS?: string;
}

export default function SchedulesTableClient({ schedules }: { schedules: Schedule[] }) {
  // Extract unique filter values (ensure all values are strings)
  const classOptions = Array.from(new Set(schedules.map(s => String(s.CLASS_NAME ?? s.CLASS_ID)))).map(c => ({ value: c, label: c }));
  const ownerOptions = Array.from(new Set(schedules.map(s => String(s.OWNER)))).map(o => ({ value: o, label: o }));
  const statusOptions = Array.from(new Set(schedules.map(s => String(s.STATUS || 'DRAFT')))).map(s => ({ value: s, label: s }));

  // Filter state (client-side)
  const [nameFilter, setNameFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s =>
      (!nameFilter || s.NAME.toLowerCase().includes(nameFilter.toLowerCase())) &&
      (!classFilter || String(s.CLASS_NAME || s.CLASS_ID) === classFilter) &&
      (!ownerFilter || s.OWNER === ownerFilter) &&
      (!statusFilter || (s.STATUS || 'DRAFT') === statusFilter)
    );
  }, [schedules, nameFilter, classFilter, ownerFilter, statusFilter]);

  return (
    <Card shadow="md" radius="lg" p="xl" withBorder style={{ maxWidth: 1000, width: "90vw", margin: "32px auto" }}>
      <Group justify="space-between" align="center" mb="md">
        <Title order={2} c="taupe">Schedules</Title>
        <Link href="/en/my-tenancy/schedules/new">
          <Button leftSection={"+"} color="cambridge">
            Create New Schedule
          </Button>
        </Link>
      </Group>
      {/* Filter controls */}
      <Group mb="md" gap="md" wrap="wrap">
        <TextInput
          label="Name"
          placeholder="Filter by name"
          value={nameFilter}
          onChange={e => setNameFilter(e.currentTarget.value)}
          style={{ minWidth: 180 }}
        />
        <Select
          label="Class"
          placeholder="All classes"
          data={classOptions}
          value={classFilter}
          onChange={value => setClassFilter(value || "")}
          clearable
          style={{ minWidth: 160 }}
        />
        <Select
          label="Owner"
          placeholder="All owners"
          data={ownerOptions}
          value={ownerFilter}
          onChange={value => setOwnerFilter(value || "")}
          clearable
          style={{ minWidth: 160 }}
        />
        <Select
          label="Status"
          placeholder="All statuses"
          data={statusOptions}
          value={statusFilter}
          onChange={value => setStatusFilter(value || "")}
          clearable
          style={{ minWidth: 140 }}
        />
      </Group>
      {filteredSchedules && filteredSchedules.length > 0 ? (
        <MantineTable.ScrollContainer minWidth={700}>
          <MantineTable striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="xs" horizontalSpacing="md" stickyHeader stickyHeaderOffset={56}>
            <MantineTable.Thead>
              <MantineTable.Tr>
                <MantineTable.Th>Name</MantineTable.Th>
                <MantineTable.Th>Class</MantineTable.Th>
                <MantineTable.Th>Owner</MantineTable.Th>
                <MantineTable.Th>Status</MantineTable.Th>
                <MantineTable.Th style={{ textAlign: "right" }}>Actions</MantineTable.Th>
              </MantineTable.Tr>
            </MantineTable.Thead>
            <MantineTable.Tbody>
              {filteredSchedules.map((schedule: Schedule) => (
                <MantineTable.Tr key={schedule.ID} style={{ borderLeft: `4px solid var(--mantine-color-cambridge-5)` }}>
                  <MantineTable.Td style={{ fontWeight: 500 }}>{schedule.NAME}</MantineTable.Td>
                  <MantineTable.Td>{schedule.CLASS_NAME || schedule.CLASS_ID}</MantineTable.Td>
                  <MantineTable.Td>{schedule.OWNER}</MantineTable.Td>
                  <MantineTable.Td>
                    <Badge color={schedule.STATUS === "PUBLISHED" ? "green" : "gray"} variant="light">
                      {schedule.STATUS || 'DRAFT'}
                    </Badge>
                  </MantineTable.Td>
                  <MantineTable.Td style={{ textAlign: "right" }}>
                    <Group gap="xs" justify="end">
                      <Link href={`/en/my-tenancy/schedules/${schedule.ID}`}>
                        <Button variant="light" size="xs" color="cambridge">Edit</Button>
                      </Link>
                      <Link href={`/en/my-tenancy/schedules/view/${schedule.ID}`}>
                        <Button variant="outline" size="xs" color="taupe">View</Button>
                      </Link>
                    </Group>
                  </MantineTable.Td>
                </MantineTable.Tr>
              ))}
            </MantineTable.Tbody>
          </MantineTable>
        </MantineTable.ScrollContainer>
      ) : (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ color: "var(--mantine-color-dimmed)" }}>No schedules found</p>
        </div>
      )}
    </Card>
  );
}
