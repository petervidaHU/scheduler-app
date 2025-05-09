import { getScheduleById } from "../../_actions/getScheduleById";
import { getDayTemplates } from "../../../timeslots/_actions/getDayTemplates";
import { getTimeslots } from "../../_actions/getTimeslots";
import SchedulePlanner from "@/components/SchedulePlanner";
import { notFound } from "next/navigation";
import { Button, Title, Group, Paper, Text, Box } from "@mantine/core";
import Link from "next/link";

interface ScheduleViewProps {
  params: {
    id: string;
  };
}

export default async function ScheduleViewPage({ params }: ScheduleViewProps) {
  const { id } = params;
  const schedule = await getScheduleById(id);
  
  if (!schedule) {
    notFound();
  }
  
  const dayTemplates = await getDayTemplates();
  const timeslots = await getTimeslots();
 
  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={2}>View Schedule: {schedule.name}</Title>
        <Group>
          <Link href="/en/my-tenancy/schedules">
            <Button variant="light">Back to List</Button>
          </Link>
          <Link href={`/en/my-tenancy/schedules/${id}`}>
            <Button>Edit Schedule</Button>
          </Link>
        </Group>
      </Group>

      <Paper p="md" withBorder mb="lg">
        <Group gap="xl">
          <div>
            <Text fw={500}>Name:</Text>
            <Text>{schedule.name}</Text>
          </div>
          <div>
            <Text fw={500}>Owner:</Text>
            <Text>{schedule.owner || "N/A"}</Text>
          </div>
          <div>
            <Text fw={500}>Status:</Text>
            <Text>{schedule.status || "DRAFT"}</Text>
          </div>
        </Group>
        {schedule.description && (
          <Box mt="md">
            <Text fw={500}>Description:</Text>
            <Text>{schedule.description}</Text>
          </Box>
        )}
      </Paper>
      
      <SchedulePlanner 
        dayTemplates={dayTemplates}
        timeslots={timeslots}
        readOnly={true}
      />
    </div>
  );
} 