import { auth } from "@/auth";
import React from "react";
import { db } from "@/lib/prisma";
import AddResource from "./add-resource";
import FilterResource from "./filter-resource";

export default async function ResourcesPage() {
  const session = await auth();

  const role = session?.user.role;
  if (!role) return;

  const courses =
    role === "FACULTY"
      ? await db.course.findMany({
          where: {
            facultyId: session?.user.id,
          },
        })
      : await db.course.findMany({
          where: {
            Enrollment: {
              some: {
                studentId: session.user.id,
              },
            },
          },
        });

  const resources =
    role === "FACULTY"
      ? await db.resource.findMany({
          where: {
            facultyId: session.user.id,
          },
          include: {
            bookMarks: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : await db.resource.findMany({
          where: {
            course: {
              Enrollment: {
                some: {
                  studentId: session.user.id,
                },
              },
            },
          },
          include: {
            bookMarks: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          {session?.user.role === "FACULTY"
            ? "Manage Resources"
            : "Course Resources"}
        </h2>
        {session?.user.role === "FACULTY" && <AddResource courses={courses} />}
      </div>
      <FilterResource
        courses={courses}
        role={role}
        availableResources={resources}
        userId={session.user.id as string}
      />
    </div>
  );
}
