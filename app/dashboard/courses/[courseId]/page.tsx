import { auth } from "@/auth";
import React from "react";
import AddAssignment from "./add-assignment";
import { db } from "@/lib/prisma";
import FacultyView from "./faculty-view";
import StudentView from "./student-view";

export default async function CourseIdPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  const { courseId } = await params;

  const assignments = await db.assignment.findMany({
    where: {
      courseId,
    },
    include: {
      submissions: {
        include: {
          student: {
            select: {
              name: true,
            },
          },
        },
      },
      course: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          {session?.user.role === "FACULTY"
            ? "Manage Assignments"
            : "Course Assignments"}
        </h2>
      </div>
      {session?.user.role === "FACULTY" && (
        <AddAssignment courseId={courseId} />
      )}
      <div className="flex-1">
        {session?.user.role === "FACULTY" ? (
          <FacultyView assignments={assignments} />
        ) : (
          <StudentView
            assignments={assignments}
            studentId={session?.user.id || ""}
          />
        )}
      </div>
    </div>
  );
}
