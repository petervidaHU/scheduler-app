import { getTenancyOverview } from "../../app/lib/services/tenancy/getTenancyOverview.server";
import { getTenancyAggregateCounts } from "../../app/lib/repositories/tenancyRepository.server";
import { useUiStore } from "../../app/store/uiStore";

jest.mock("../../app/lib/repositories/tenancyRepository.server", () => ({
  getTenancyAggregateCounts: jest.fn(),
}));

const mockedGetTenancyAggregateCounts =
  getTenancyAggregateCounts as jest.MockedFunction<typeof getTenancyAggregateCounts>;

describe("getTenancyOverview", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("returns calculated database overview on success", async () => {
    mockedGetTenancyAggregateCounts.mockResolvedValue({
      tenancies: 2,
      users: 4,
      memberships: 4,
      activeMemberships: 3,
      teachers: 5,
      classes: 6,
      timeslots: 12,
      schedules: 3,
    });

    const result = await getTenancyOverview();

    expect(result.source).toBe("database");
    expect(result.errorMessage).toBeNull();
    expect(result.overview.counts.tenancies).toBe(2);
  });

  test("returns fallback overview on repository failure", async () => {
    mockedGetTenancyAggregateCounts.mockRejectedValue(new Error("db offline"));

    const result = await getTenancyOverview();

    expect(result.source).toBe("fallback");
    expect(result.errorMessage).toContain("db offline");
    expect(result.overview.counts.tenancies).toBe(0);
  });
});

describe("uiStore", () => {
  beforeEach(() => {
    useUiStore.setState({ demoClicks: 0 });
  });

  test("increments demoClicks", () => {
    useUiStore.getState().incrementDemoClicks();
    useUiStore.getState().incrementDemoClicks();

    expect(useUiStore.getState().demoClicks).toBe(2);
  });
});
