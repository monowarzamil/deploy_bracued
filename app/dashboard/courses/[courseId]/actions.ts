"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type GradeSubmissionParams = {
  submissionId: string;
  grade: number;
  feedback: string;
};

export async function gradeSubmissionAction({
  submissionId,
  grade,
  feedback,
}: GradeSubmissionParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "FACULTY") {
      return { error: "Unauthorized" };
    }

    await db.submission.update({
      where: { id: submissionId },
      data: { grade, feedback },
    });
    revalidatePath("/dashboard/course");
    return { success: "Grade submit successful." };
  } catch (err) {
    console.log("Submit grade error:", err);
    return { error: "Something went wrong!" };
  }
}

type SubmitAssignmentParams = {
  assignmentId: string;
  fileUrl: string;
};

export async function submitAssignmentAction({
  assignmentId,
  fileUrl,
}: SubmitAssignmentParams) {
  try {
    if (!assignmentId || !fileUrl) {
      return { error: "Missing information!" };
    }

    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return { error: "Unauthorized!" };
    }

    const assignmentExist = await db.assignment.findUnique({
      where: {
        id: assignmentId,
      },
    });
    if (!assignmentExist) {
      return { error: "Course not found!" };
    }

    await db.submission.create({
      data: {
        fileUrl,
        assignmentId,
        studentId: session.user.id || "",
      },
    });

    return { success: "Assignment submit successful." };
  } catch (err) {
    console.log("Submit assignment error:", err);
    return { error: "Something went wrong!" };
  }
}

type AddAssignmentActionParams = {
  title: string;
  description: string;
  assignmentNumber: number;
  dueDate: Date;
  topic: string;
  courseId: string;
};

export async function addAssignmentAction({
  assignmentNumber,
  courseId,
  description,
  dueDate,
  title,
  topic,
}: AddAssignmentActionParams) {
  try {
    if (!assignmentNumber || !courseId || !description || !dueDate || !title) {
      return { error: "Missing information!" };
    }

    const session = await auth();
    if (!session || session.user.role !== "FACULTY") {
      return { error: "Unauthorized!" };
    }

    const courseExist = await db.course.findUnique({
      where: {
        id: courseId,
      },
    });
    if (!courseExist) {
      return { error: "Course not found!" };
    }

    const assignment = await db.assignment.create({
      data: {
        assignmentNumber,
        description,
        dueDate,
        title,
        courseId,
        facultyId: session.user.id || "",
        topic,
      },
    });
    await db.notification.create({
      data: {
        courseId: assignment.courseId,
        userId: session.user.id,
        title: "Post a new assignment",
        message: `The assignment about ${assignment.title}`,
      },
    });
    revalidatePath(`/dashboard/course/${courseId}`);
    return { success: "Assignment post successful.", assignment };
  } catch (err) {
    console.log("Add assignment error:", err);
    return { error: "Something went wrong!" };
  }
}
