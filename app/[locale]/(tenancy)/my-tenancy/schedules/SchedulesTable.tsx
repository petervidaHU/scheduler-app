"use client";
import { Card, Button, Group, Badge, Table as MantineTable, Title, useMantineColorScheme } from "@mantine/core";
import Link from "next/link";

interface Schedule {
  ID: number;
  NAME: string;
  CLASS_ID: number;
  CLASS_NAME?: string;
  OWNER: string;
  STATUS?: string;
}

export default function SchedulesTable({ filteredSchedules }: { filteredSchedules: Schedule[] }) {
  const { colorScheme } = useMantineColorScheme();

  return (
    <>
      {filteredSchedules && filteredSchedules.length > 0 ? (
        <MantineTable.ScrollContainer minWidth={700}>
          <MantineTable striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="xs" horizontalSpacing="md" stickyHeader stickyHeaderOffset={0}>
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
                    <Badge
                      color={(schedule.STATUS ?? 'DRAFT') === "PUBLISHED" ? "green" : "gray"}
                      variant="filled"
                      style={{
                        color: colorScheme === 'light' ? '#222' : undefined,
                        backgroundColor: colorScheme === 'light' ? 'var(--mantine-color-cambridge-2, #e6f4ea)' : undefined,
                        fontWeight: 600,
                        letterSpacing: 0.2,
                      }}
                    >
                      {schedule.STATUS ?? 'DRAFT'}
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
    </>
  );
}
