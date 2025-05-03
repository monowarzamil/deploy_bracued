import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import TakeAttendanceForm from "./take-attendance-form";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function TakeAttendancePage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  const date =
    typeof searchParams.date === "string" ? searchParams.date : undefined;
  const courseId =
    typeof searchParams.courseId === "string"
      ? searchParams.courseId
      : undefined;
  const section =
    typeof searchParams.section === "string" ? searchParams.section : undefined;
  const time =
    typeof searchParams.time === "string" ? searchParams.time : undefined;

  if (!date || !courseId || !section || !time) {
    return <div>Missing required parameters</div>;
  }

  const session = await auth();

  const course = await db.course.findFirst({
    where: {
      id: courseId as string,
      facultyId: session?.user.id,
      section: section as string,
    },
    include: {
      faculty: true,
      Enrollment: {
        include: {
          student: true,
        },
      },
    },
  });

  if (!course) return <div>Course not found</div>;

  return (
    <div className="container mx-auto py-10">
      <TakeAttendanceForm course={course} date={date} timeSchedule={time} />
    </div>
  );
}
