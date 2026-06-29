import {
  createSyllabusEntry,
  updateSyllabusEntry,
  deleteSyllabusEntry,
  loadSyllabusPage,
} from "../../app/lib/services/syllabus/manageSyllabus.server";
import {
  getSyllabusItems,
  getSyllabusEntityOptions,
  createSyllabusItem,
  updateSyllabusItem,
  deleteSyllabusItem,
} from "../../app/lib/repositories/syllabusRepository.server";

jest.mock("../../app/lib/repositories/syllabusRepository.server", () => ({
  getSyllabusItems: jest.fn(),
  getSyllabusEntityOptions: jest.fn(),
  createSyllabusItem: jest.fn(),
  updateSyllabusItem: jest.fn(),
  deleteSyllabusItem: jest.fn(),
}));

const mockedGetSyllabusItems = getSyllabusItems as jest.MockedFunction<typeof getSyllabusItems>;
const mockedGetSyllabusEntityOptions = getSyllabusEntityOptions as jest.MockedFunction<typeof getSyllabusEntityOptions>;
const mockedCreateSyllabusItem = createSyllabusItem as jest.MockedFunction<typeof createSyllabusItem>;
const mockedUpdateSyllabusItem = updateSyllabusItem as jest.MockedFunction<typeof updateSyllabusItem>;
const mockedDeleteSyllabusItem = deleteSyllabusItem as jest.MockedFunction<typeof deleteSyllabusItem>;

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("manageSyllabus service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ─── loadSyllabusPage ────────────────────────────────────────────────────────

  test("loadSyllabusPage returns items and options with parsed filters", async () => {
    const items = [{ id: "i1", week: 3, topic: "Photosynthesis", notes: null, subject: { id: "s1", name: "Biology" }, class: null }];
    const options = { subjects: [{ id: "s1", name: "Biology" }], classes: [] };
    mockedGetSyllabusItems.mockResolvedValue(items);
    mockedGetSyllabusEntityOptions.mockResolvedValue(options);

    const result = await loadSyllabusPage("t1", "http://localhost/en/my-tenancy/syllabus?subjectId=s1");

    expect(mockedGetSyllabusItems).toHaveBeenCalledWith("t1", { subjectId: "s1", classId: undefined });
    expect(result.items).toEqual(items);
    expect(result.options).toEqual(options);
    expect(result.filters.subjectId).toBe("s1");
    expect(result.filters.classId).toBe("");
  });

  test("loadSyllabusPage passes no filters when query params are absent", async () => {
    mockedGetSyllabusItems.mockResolvedValue([]);
    mockedGetSyllabusEntityOptions.mockResolvedValue({ subjects: [], classes: [] });

    const result = await loadSyllabusPage("t1", "http://localhost/en/my-tenancy/syllabus");

    expect(mockedGetSyllabusItems).toHaveBeenCalledWith("t1", { subjectId: undefined, classId: undefined });
    expect(result.filters).toEqual({ subjectId: "", classId: "" });
  });

  // ─── createSyllabusEntry ─────────────────────────────────────────────────────

  test("createSyllabusEntry returns validation errors for missing fields", async () => {
    const fd = makeFormData({ subjectId: "", week: "", topic: "" });
    const result = await createSyllabusEntry("t1", fd);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.subjectId).toBeDefined();
      expect(result.errors.week).toBeDefined();
      expect(result.errors.topic).toBeDefined();
    }
    expect(mockedCreateSyllabusItem).not.toHaveBeenCalled();
  });

  test("createSyllabusEntry rejects week outside 1–52 range", async () => {
    const fd = makeFormData({ subjectId: "s1", week: "99", topic: "Topic" });
    const result = await createSyllabusEntry("t1", fd);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.week).toBeDefined();
  });

  test("createSyllabusEntry creates item with valid data", async () => {
    mockedCreateSyllabusItem.mockResolvedValue({ id: "new1" });
    const fd = makeFormData({ subjectId: "s1", classId: "c1", week: "5", topic: "Cells", notes: "See chapter 3" });
    const result = await createSyllabusEntry("t1", fd);
    expect(result.ok).toBe(true);
    expect(mockedCreateSyllabusItem).toHaveBeenCalledWith({
      tenancyId: "t1",
      subjectId: "s1",
      classId: "c1",
      week: 5,
      topic: "Cells",
      notes: "See chapter 3",
    });
  });

  test("createSyllabusEntry sets classId to null when empty", async () => {
    mockedCreateSyllabusItem.mockResolvedValue({ id: "new2" });
    const fd = makeFormData({ subjectId: "s1", classId: "", week: "1", topic: "Intro" });
    await createSyllabusEntry("t1", fd);
    expect(mockedCreateSyllabusItem).toHaveBeenCalledWith(
      expect.objectContaining({ classId: null }),
    );
  });

  // ─── updateSyllabusEntry ─────────────────────────────────────────────────────

  test("updateSyllabusEntry returns error if id is missing", async () => {
    const fd = makeFormData({ id: "", subjectId: "s1", week: "2", topic: "T" });
    const result = await updateSyllabusEntry("t1", fd);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.id).toBeDefined();
  });

  test("updateSyllabusEntry updates item with valid data", async () => {
    mockedUpdateSyllabusItem.mockResolvedValue(undefined);
    const fd = makeFormData({ id: "i1", subjectId: "s1", classId: "", week: "10", topic: "Updated", notes: "" });
    const result = await updateSyllabusEntry("t1", fd);
    expect(result.ok).toBe(true);
    expect(mockedUpdateSyllabusItem).toHaveBeenCalledWith({
      id: "i1",
      tenancyId: "t1",
      subjectId: "s1",
      classId: null,
      week: 10,
      topic: "Updated",
      notes: null,
    });
  });

  // ─── deleteSyllabusEntry ─────────────────────────────────────────────────────

  test("deleteSyllabusEntry returns error if id is missing", async () => {
    const fd = makeFormData({ id: "" });
    const result = await deleteSyllabusEntry("t1", fd);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.id).toBeDefined();
  });

  test("deleteSyllabusEntry deletes item by id", async () => {
    mockedDeleteSyllabusItem.mockResolvedValue(undefined);
    const fd = makeFormData({ id: "i1" });
    const result = await deleteSyllabusEntry("t1", fd);
    expect(result.ok).toBe(true);
    expect(mockedDeleteSyllabusItem).toHaveBeenCalledWith("i1", "t1");
  });
});
