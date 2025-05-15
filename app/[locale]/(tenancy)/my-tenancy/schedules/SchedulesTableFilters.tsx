"use client";
import { Group, TextInput, Select } from "@mantine/core";
import { useTranslations } from "next-intl";

interface SchedulesTableFiltersProps {
  nameFilter: string;
  setNameFilter: (v: string) => void;
  classFilter: string;
  setClassFilter: (v: string) => void;
  ownerFilter: string;
  setOwnerFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  classOptions: { value: string; label: string }[];
  ownerOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
}

export default function SchedulesTableFilters({
  nameFilter,
  setNameFilter,
  classFilter,
  setClassFilter,
  ownerFilter,
  setOwnerFilter,
  statusFilter,
  setStatusFilter,
  classOptions,
  ownerOptions,
  statusOptions,
}: SchedulesTableFiltersProps) {
  const t = useTranslations("schedule");
  return (
    <Group mb="md" gap="md" wrap="wrap">
      <TextInput
        label={t("name")}
        placeholder={t("filterByName")}
        value={nameFilter}
        onChange={e => setNameFilter(e.currentTarget.value)}
        style={{ minWidth: 180 }}
      />
      <Select
        label={t("class")}
        placeholder={t("allClasses")}
        data={classOptions}
        value={classFilter}
        onChange={value => setClassFilter(value || "")}
        clearable
        style={{ minWidth: 160 }}
      />
      <Select
        label={t("owner")}
        placeholder={t("allOwners")}
        data={ownerOptions}
        value={ownerFilter}
        onChange={value => setOwnerFilter(value || "")}
        clearable
        style={{ minWidth: 160 }}
      />
      <Select
        label={t("status")}
        placeholder={t("allStatuses")}
        data={statusOptions}
        value={statusFilter}
        onChange={value => setStatusFilter(value || "")}
        clearable
        style={{ minWidth: 140 }}
      />
    </Group>
  );
}
