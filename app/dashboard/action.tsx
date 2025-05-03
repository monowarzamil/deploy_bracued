"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface Props {
  status: BookingStatus;
  id: string;
  studentId: string;
}
export async function updateStatusAction({ id, status, studentId }: Props) {
  try {
    const session = await auth();
    const user = await db.profile.findUnique({
      where: {
        id: session?.user.id,
        role: "FACULTY",
      },
    });

    if (!user) return { error: "unauthorized" };

    if (!id || !status) {
      return { error: "Not found values" };
    }

    const slot = await db.consultationSlot.findUnique({
      where: { id },
      select: { facultyId: true },
    });

    if (!slot) {
      return { error: "Slot not found!" };
    }

    if (status === "confirmed") {
      await db.booking.update({
        where: {
          slotId_studentId: {
            slotId: id,
            studentId,
          },
        },
        data: {
          status,
        },
      });
      revalidatePath("/dashboard");
      return { success: "Request accepted successfully" };
    } else {
      await db.booking.update({
        where: {
          slotId_studentId: {
            slotId: id,
            studentId,
          },
        },
        data: {
          status,
        },
      });
      revalidatePath("/dashboard");
      return { success: "Request rejected successfully" };
    }
  } catch (err) {
    return { error: "Something went wrong!", err };
  }
}
