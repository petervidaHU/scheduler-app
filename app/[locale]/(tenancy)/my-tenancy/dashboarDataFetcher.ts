import { getDbInstance } from "@/lib/database/db-instance";
import { Entities } from "@/types/Entities";

export const dataFetcherAll = async <T>(
    fetcher: (K: Entities) => Promise<T[]>,
    label: Entities,
): Promise<{data: T[], error: string | null}> => {
    const db = await getDbInstance();
    const boundFetch = fetcher.bind(db); 
    try {
        const data = await boundFetch(label);
        return { data, error: null };
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        return { data: [], error: (error as unknown as string).toString() };
    }
};