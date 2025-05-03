"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DeleteCourseActionParams = {
  courseId: string;
};

export async function deleteCourseAction({
  courseId,
}: DeleteCourseActionParams) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "FACULTY") {
      return { error: "Unauthorized" };
    }

    const courseExist = await db.course.findFirst({
      where: {
        id: courseId,
      },
    });

    if (!courseExist) {
      return { error: "Course not found!" };
    }

    await db.course.delete({
      where: {
        id: courseExist.id,
      },
    });

    revalidatePath("/dashboard/courses");
    return { success: "Course deleted." };
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
}

const bracuStudentID = [
  "21201187",
  "21201140",
  "21301683",
  "22301167",
  "23101148",
  "24101456",
];

interface EnrollCourseActionProps {
  studentId: string;
  courseId: string;
}

export async function enrollCourseAction({
  studentId,
  courseId,
}: EnrollCourseActionProps) {
  try {
    if (!studentId || !courseId) return { error: "Missing information." };

    const studentIdMatch = bracuStudentID.includes(studentId);
    if (!studentIdMatch) {
      return { error: "Invalid BRACU student ID." };
    }

    const session = await auth();

    if (!session?.user.id || session?.user.role !== "STUDENT") {
      return { error: "Unauthorized" };
    }

    const courseExist = await db.enrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId,
      },
    });

    if (courseExist) {
      return { error: "You are already enrolled  in this course." };
    }

    await db.enrollment.create({
      data: {
        courseId,
        studentId: session.user.id,
      },
    });
    revalidatePath("/dashboard/course");
    return { success: "Enrolled successful." };
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!", err };
  }
}

interface CreateCourseActionProps {
  values: {
    title: string;
    description: string;
    schedule: string;
    courseCode: string;
    credit: string;
    section: string;
  };
  days: string[];
}
export async function createCourseAction({
  values,
  days,
}: CreateCourseActionProps) {
  try {
    const { courseCode, credit, description, schedule, title, section } =
      values;
    if (
      !courseCode ||
      !section ||
      !credit ||
      !description ||
      !schedule ||
      !title ||
      !days
    ) {
      return { error: "Please fill in all fields." };
    }

    const session = await auth();

    if (!session?.user.id && session?.user.role !== "FACULTY") {
      return { error: "Unauthorized" };
    }

    const courseExist = await db.course.findUnique({
      where: {
        courseCode: values.courseCode.toLowerCase(),
      },
    });

    if (courseExist) {
      return { error: "Course already exist." };
    }
    await db.course.create({
      data: {
        title: values.title,
        courseCode: values.courseCode.toUpperCase(),
        credit: values.credit.toLowerCase(),
        description: values.description,
        schedule: values.schedule,
        days,
        section: section.toUpperCase(),
        facultyId: session.user.id as string,
      },
    });

    revalidatePath("/dashboard/courses");
    return { success: "Create course successful." };
  } catch (err) {
    return { error: "Internal server error", err };
  }
}
