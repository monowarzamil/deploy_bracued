"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const deleteConsultationSlot = async (slotId: string) => {
  const session = await auth();

  if (!session?.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    const slot = await db.consultationSlot.findFirst({
      where: { id: slotId, facultyId: session.user.id },
    });

    if (!slot) {
      return {
        error: "Slot not found or you don't have permission to delete it",
      };
    }

    await db.booking.deleteMany({
      where: { slotId },
    });

    await db.consultationSlot.deleteMany({
      where: {
        id: slotId,
        facultyId: session.user.id,
      },
    });

    revalidatePath("/dashboard/consultations");
    return { success: "Consultation slot deleted successfully" };
  } catch (error) {
    console.error("Error deleting consultation slot:", error);
    return { error: "Failed to delete consultation slot" };
  }
};

interface bookProps {
  slotId: string;
}

export async function bookConsultationSlotsAction({ slotId }: bookProps) {
  const session = await auth();

  const student = await db.profile.findUnique({
    where: {
      id: session?.user.id,
      role: "STUDENT",
    },
    include: {
      Booking: {
        include: {
          slot: true,
        },
      },
    },
  });

  if (!student) return { error: "Unauthorized - Student not found" };

  const slot = await db.consultationSlot.findUnique({
    where: { id: slotId },
    include: {
      faculty: true,
      booking: true,
      students: true,
    },
  });

  if (!slot) return { error: "Consultation slot not found" };

  const existingBooking = slot.booking.find((b) => b.studentId === student.id);
  if (existingBooking) {
    return {
      error:
        existingBooking.status === "confirmed"
          ? "You already have a confirmed booking for this slot"
          : "You already have a pending booking for this slot",
    };
  }

  try {
    await db.$transaction(async (prisma) => {
      await prisma.booking.create({
        data: {
          slotId: slot.id,
          studentId: student.id,
          status: "pending",
        },
      });

      await prisma.consultationSlot.update({
        where: { id: slot.id },
        data: {
          students: {
            connect: { id: student.id },
          },
        },
      });
    });

    return { success: "Consultation request send successfully" };
  } catch (err) {
    console.error("Booking error:", err);
    return { error: "Failed to book consultation slot", details: err };
  }
}
interface CreateProps {
  values: {
    date: Date;
    endTime: string;
    startTime: string;
    courseCode: string;
    room: string;
  };
  days: string[];
}
export async function createConsultationSlotsAction({
  values,
  days,
}: CreateProps) {
  try {
    const { courseCode, date, endTime, room, startTime } = values;
    if (!courseCode || !date || !endTime || !room || !startTime || !days) {
      return { error: "Please fill in all fields." };
    }

    const session = await auth();
    const user = await db.profile.findUnique({
      where: {
        id: session?.user.id,
        role: "FACULTY",
      },
    });

    if (!user) return { error: "unauthorized" };
    await db.consultationSlot.create({
      data: {
        date,
        endTime,
        startTime,
        courseCode: courseCode,
        facultyId: user.id,
        room,
        days,
      },
    });
    revalidatePath("/dashboard/consultations");
    return { success: "Consultation slot created successful." };
  } catch (err) {
    return { error: "Something went wrong!", err };
  }
}
