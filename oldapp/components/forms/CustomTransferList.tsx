import { FC, useState } from "react";
import { Paper, ActionIcon, Text, Box, Button } from "@mantine/core";
import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";
import { DataWithOptions } from "@/types/ScheduleTypes";
import { Entities } from "@/types/Entities";
import { insertMultipleTenancyBasedData } from "@/app/[locale]/(tenancy)/_actions/insertMultipleTenancybasedData";
import { useStore } from "@/store/store";
import { refetchTenancyBasedData } from "@/lib/UpdateTenancyBasedData";
import { labelMapper } from "@/lib/hooks/labelMapperForTenancyBasedData";

interface Item {
  value: string;
  label: string;
  description: string;
}

interface props {
  values: DataWithOptions<any>;
  label: Entities.specialty | Entities.subject;
}

export const CustomTransferList: FC<props> = ({ values, label }) => {
    const { addToast, updateTenancyBasedData } = useStore();
  const mappedValues = Object.values(values);
  const [available, setAvailable] = useState<Item[]>(mappedValues);
  const [selected, setSelected] = useState<Item[]>([]);

  const [availableSelected, setAvailableSelected] = useState<string[]>([]);
  const [selectedSelected, setSelectedSelected] = useState<string[]>([]);

  const moveToSelected = () => {
    const itemsToMove = available.filter((item) =>
      availableSelected.includes(item.value)
    );
    setAvailable((prev) =>
      prev.filter((item) => !availableSelected.includes(item.value))
    );
    setSelected((prev) => [...prev, ...itemsToMove]);
    setAvailableSelected([]);
  };

  const moveToAvailable = () => {
    const itemsToMove = selected.filter((item) =>
      selectedSelected.includes(item.value)
    );
    setSelected((prev) =>
      prev.filter((item) => !selectedSelected.includes(item.value))
    );
    setAvailable((prev) => [...prev, ...itemsToMove]);
    setSelectedSelected([]);
  };

  const renderListItem = (
    item: Item,
    isSelected: boolean,
    toggle: (value: string) => void
  ) => (
    <Box
      key={item.value}
      onClick={() => toggle(item.value)}
      style={{
        display: "flex",
        flexDirection: "row",
        padding: "8px",
        margin: "8px 0",
        borderRadius: "4px",
        cursor: "pointer",
        backgroundColor: isSelected ? "#e3f2fd" : "#fff",
        border: "1px solid #ced4da",
        alignItems: "center",
      }}
    >
      <Box style={{ width: "40%", paddingRight: "8px" }}>
        <Text size="sm">{item?.label}</Text>
      </Box>
      <Box style={{ width: "60%" }}>
        <Text size="sm" color="dimmed">
          {item.description}
        </Text>
      </Box>
    </Box>
  );

  const toggleAvailable = (value: string) => {
    setAvailableSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleSelected = (value: string) => {
    setSelectedSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const saveHandler = async() => {
    console.log("save", selected);
    const result = await insertMultipleTenancyBasedData(label, selected);
    console.log("ROWS AFFECTED::", result);
    if (!result.error) {
      setAvailable(mappedValues);
      setSelected([]);
      const newData = await refetchTenancyBasedData(label);
      console.log('newdata:', newData);
      updateTenancyBasedData({ [labelMapper[label]]: { data: newData.data } });
      addToast({
          title: "Success",
          message: `${label} saved successfully: ${result.rowsAffected}`,
          autoClose: false,
          id: Date.now().toString(),
          type: "success",
      })
    } else {
      addToast({
        title: "Error",
        message: result.error,
        type: "error",
        autoClose: false,
        id: Date.now().toString(),
      });
    }
  };

  return (
    <>
      <Box
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Paper
          shadow="xs"
          style={{
            width: "40%",
            height: "300px",
            overflowY: "auto",
            padding: "16px",
          }}
        >
          {available.map((item) =>
            renderListItem(
              item,
              availableSelected.includes(item.value),
              toggleAvailable
            )
          )}
        </Paper>

        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <ActionIcon
            size="lg"
            variant="filled"
            onClick={moveToSelected}
            disabled={availableSelected.length === 0}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
          <ActionIcon
            size="lg"
            variant="filled"
            onClick={moveToAvailable}
            disabled={selectedSelected.length === 0}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
        </Box>

        <Paper
          shadow="xs"
          style={{
            width: "40%",
            height: "300px",
            overflowY: "auto",
            padding: "16px",
          }}
        >
          {selected.map((item) =>
            renderListItem(
              item,
              selectedSelected.includes(item.value),
              toggleSelected
            )
          )}
        </Paper>
      </Box>
      <Button onClick={saveHandler}>Save selected items</Button>
    </>
  );
};
