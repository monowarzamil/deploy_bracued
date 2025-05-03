import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { StudentAttendanceTable } from "./student-attendance-table";

export default async function AttendanceDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  const courseId = (await params).courseId;

  // Fetch course with attendance records
  const course = await db.course.findUnique({
    where: { id: courseId, facultyId: session?.user.id },
    include: {
      faculty: true,
      Enrollment: {
        include: {
          student: true,
        },
      },
      Attendance: {
        include: {
          records: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!course) return <div>Course not found</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">
        Attendance for {course.title} - Section {course.section}
      </h1>

      <StudentAttendanceTable
        enrollments={course.Enrollment}
        attendanceRecords={course.Attendance}
      />
    </div>
  );
}
