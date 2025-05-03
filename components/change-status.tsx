"use client";
import { updateStatusAction } from "@/app/dashboard/action";
import { BookingStatus } from "@prisma/client";
import { Check, X } from "lucide-react";
import React, { useTransition } from "react";
import { toast } from "sonner";

export default function ChangeStatus({
  slotId,
  studentId,
}: {
  studentId: string;
  slotId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (newStatus: BookingStatus) => {
    startTransition(async () => {
      const result = await updateStatusAction({
        id: slotId,
        studentId,
        status: newStatus,
      });

      if (result?.error) {
        toast(result.error);
      } else {
        toast(result.success);
      }
    });
  };
  return (
    <>
      <button
        disabled={isPending}
        className="bg-green-100 p-2 rounded-full shadow"
        onClick={() => handleStatusChange("confirmed")}
      >
        <Check className="text-green-500 w-4 h-4" />
      </button>
      <button
        disabled={isPending}
        className="bg-red-100 p-2 rounded-full shadow"
        onClick={() => handleStatusChange("rejected")}
      >
        <X className="text-red-500 w-4 h-4" />
      </button>
    </>
  );
}
