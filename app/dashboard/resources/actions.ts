"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DeleteResourceActionParams = {
  resourceId: string;
};

export async function deleteResourceAction({
  resourceId,
}: DeleteResourceActionParams) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "FACULTY") {
      return { error: "Unauthorized" };
    }

    const resourceExist = await db.resource.findFirst({
      where: {
        id: resourceId,
      },
    });

    if (!resourceExist) {
      return { error: "Resource not found!" };
    }

    await db.resource.delete({
      where: {
        id: resourceExist.id,
      },
    });

    revalidatePath("/dashboard/resource");
    return { success: "Resource deleted." };
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
}

type BookMarkActionParams = {
  resourceId: string;
};

export async function bookMarkAction({ resourceId }: BookMarkActionParams) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "STUDENT") {
      return { error: "Unauthorized" };
    }

    const existingBookmark = await db.bookMark.findUnique({
      where: {
        profileId_resourceId: {
          profileId: session.user.id as string,
          resourceId,
        },
      },
    });
    if (existingBookmark) {
      await db.bookMark.delete({
        where: {
          profileId_resourceId: {
            profileId: session.user.id as string,
            resourceId,
          },
        },
      });
      revalidatePath("/dashboard/resource");
      return { success: "Bookmark removed." };
    } else {
      await db.bookMark.create({
        data: { profileId: session.user.id as string, resourceId },
      });
    }

    revalidatePath("/dashboard/resource");
    return { success: "Bookmark added." };
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
}

interface AddNewResourceActionParams {
  title: string;
  description: string;
  type: string;
  url: string;
  topic: string;
  courseId: string;
}

export async function addNewResourceAction({
  courseId,
  description,
  title,
  topic,
  type,
  url,
}: AddNewResourceActionParams) {
  try {
    if (!title || !type || !courseId || !url) {
      return { error: "Missing information." };
    }

    const session = await auth();
    if (!session?.user.id || session?.user.role !== "FACULTY") {
      return { error: "Unauthorized" };
    }

    const courseExist = await db.course.findFirst({
      where: {
        id: courseId,
        facultyId: session.user.id,
      },
    });

    if (!courseExist) {
      return { error: "Course not found." };
    }

    const newResource = await db.resource.create({
      data: {
        title,
        type,
        url,
        courseId,
        description,
        topic,
        facultyId: session.user.id,
      },
    });

    await db.notification.create({
      data: {
        userId: session.user.id,
        courseId: newResource.courseId,
        title: "Post a new resource",
        message: `The resource about ${newResource.title}`,
      },
    });

    revalidatePath("/dashboard/resources");
    return { success: "New resource added." };
  } catch (err) {
    console.log("Add resource error", err);
    return { error: "Something went wrong!" };
  }
}
