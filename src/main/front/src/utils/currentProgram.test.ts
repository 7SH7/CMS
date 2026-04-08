import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { currentProgram } from "./currentProgram";

// 기준이 되는 mock 날짜: 2025-06-03T12:00:00Z
const MOCK_NOW = new Date("2025-06-03T12:00:00Z");

// ISO 문자열로 날짜 생성 (시간대 문제 방지)
function daysFromNow(days: number) {
  const d = new Date(MOCK_NOW);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const samplePrograms = [
  {
    id: "prog1",
    name: "진행중 프로그램",
    startDate: daysFromNow(-2), // 2일 전
    endDate: daysFromNow(27), // 27일 후
  },
  {
    id: "prog2",
    name: "종료된 프로그램",
    startDate: daysFromNow(-63), // 63일 전
    endDate: daysFromNow(-33), // 33일 전
  },
  {
    id: "prog3",
    name: "미래 프로그램",
    startDate: daysFromNow(28), // 28일 후
    endDate: daysFromNow(59), // 59일 후
  },
];

describe("currentProgram", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("returns only the ongoing program at the mocked current date", () => {
    const result = currentProgram(samplePrograms);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("prog1");
    expect(result[0].name).toBe("진행중 프로그램");
  });

  it("returns an empty array if there is no ongoing program", () => {
    const result = currentProgram([samplePrograms[1], samplePrograms[2]]);
    expect(result).toEqual([]);
  });
});
