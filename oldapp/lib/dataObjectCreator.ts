import { DataWithOptions } from "@/types/ScheduleTypes";

export const dataObjectCreator = <T extends { ID: number; NAME: string }>(
    data: T[]
  ): DataWithOptions<T> => {
    return data.reduce((acc, item) => {
      acc[item.ID] = {
        value: item.ID.toString(),
        label: item.NAME,
        ...item,
      };
      return acc;
    }, {} as DataWithOptions<T>);
  };