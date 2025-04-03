import db from "@/lib/database/db-instance";

export const dataFetcherAll = async <T>(
    fetcher: () => Promise<T[]>
): Promise<{data: T[], error: string | null}> => {
    const boundFetch = fetcher.bind(db); 
    try {
        const data = await boundFetch();
        return { data, error: null };
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        return { data: [], error: (error as unknown as string).toString() };
    }
};