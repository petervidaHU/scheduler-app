"use client";
import { useState, useMemo } from "react";
import { Card, Button, Group, Title, useMantineColorScheme } from "@mantine/core";
import Link from "next/link";
import SchedulesTableFilters from "./SchedulesTableFilters";
import SchedulesTable from "./SchedulesTable";

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
  const statusOptions = Array.from(new Set(schedules.map(s => String(s.STATUS ?? 'DRAFT')).filter(Boolean))).map(s => ({ value: s, label: s }));

  // Filter state (client-side)
  const [nameFilter, setNameFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { colorScheme } = useMantineColorScheme();

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s =>
      (!nameFilter || s.NAME.toLowerCase().includes(nameFilter.toLowerCase())) &&
      (!classFilter || String(s.CLASS_NAME || s.CLASS_ID) === classFilter) &&
      (!ownerFilter || s.OWNER === ownerFilter) &&
      (!statusFilter || (s.STATUS ?? 'DRAFT') === statusFilter)
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
      <SchedulesTableFilters
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        ownerFilter={ownerFilter}
        setOwnerFilter={setOwnerFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        classOptions={classOptions}
        ownerOptions={ownerOptions}
        statusOptions={statusOptions}
      />
      <SchedulesTable filteredSchedules={filteredSchedules} />
    </Card>
  );
}
