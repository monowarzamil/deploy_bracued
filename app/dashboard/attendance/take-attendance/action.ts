"use server";

import { db } from "@/lib/prisma";

export async function createAttendanceWithRecords(data: {
  date: Date;
  courseId: string;
  facultyId: string;
  timeSlot: string;
  records: Array<{ studentId: string; status: boolean }>;
}) {
  try {
    const attendance = await db.attendance.create({
      data: {
        date: data.date,
        courseId: data.courseId,
        facultyId: data.facultyId,
        timeSlot: data.timeSlot,
        records: {
          create: data.records.map((record) => ({
            studentId: record.studentId,
            status: record.status,
          })),
        },
      },
    });

    return { success: true, attendance };
  } catch (error) {
    console.error("Error creating attendance:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
