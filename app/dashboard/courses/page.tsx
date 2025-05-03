import { auth } from "@/auth";
import React from "react";
import { db } from "@/lib/prisma";
import FacultyView from "./faculty-view";
import StudentView from "./student-view";

export default async function CoursesPage() {
  const session = await auth();
  const role = session?.user.role;
  if (!role) return;

  const courses = await db.course.findMany({
    where: {
      facultyId: session.user.id,
      faculty: {
        role: "FACULTY",
      },
    },
    include: {
      faculty: {
        select: {
          name: true,
        },
      },
      Enrollment: true,
    },
  });
  const myCourses = await db.course.findMany({
    where: {
      Enrollment: {
        some: {
          studentId: session.user.id,
        },
      },
    },
    include: {
      faculty: {
        select: {
          name: true,
        },
      },
      Enrollment: {
        where: {
          studentId: session.user.id,
        },
      },
    },
  });
  const availableCourses = await db.course.findMany({
    where: {
      Enrollment: {
        none: {
          studentId: session.user.id,
        },
      },
    },
    include: {
      faculty: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          {role === "FACULTY"
            ? "Faculty Courses Portal"
            : "Student Courses Portal"}
        </h2>
      </div>
      {role == "STUDENT" ? (
        <StudentView
          role={role}
          myCourses={myCourses}
          availableCourses={availableCourses}
        />
      ) : (
        <FacultyView role={role} courses={courses} />
      )}
    </div>
  );
}
