import { getBasicEntities } from "@/app/[locale]/(tenancy)/_actions/getBasicEntities";
import { Entities } from "@/types/Entities";
import { Box, Group, Button, Collapse, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { FC, useEffect, useState } from "react";
import { CustomTransferList } from "./CustomTransferList";

interface props {
  entityType: Entities.specialty | Entities.subject;
}

const AddBasicEntities: FC<props> = ({ entityType }) => {
  const [opened, { toggle }] = useDisclosure(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getBasicEntities(entityType);
        setData(response);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityType]);

  console.log("basic specialty data:", data);
  return (
    <Box mx="auto">
      <Group justify="center" mb={5}>
        <Button onClick={toggle}>Add basic {entityType}</Button>
      </Group>
      {error ? (
        <Text>{error}</Text>
      ) : (
        <Collapse in={opened}>
          {data?.data && (
            <CustomTransferList values={data?.data} label={entityType} />
          )}
        </Collapse>
      )}
    </Box>
  );
};

export default AddBasicEntities;
