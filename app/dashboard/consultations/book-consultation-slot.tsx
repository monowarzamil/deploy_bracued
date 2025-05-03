"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { bookConsultationSlotsAction } from "./actions";
import { useRouter } from "next/navigation";

export default function BookConsultationSlot({ slotId }: { slotId: string }) {
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey: ["book-slots"],
    mutationFn: bookConsultationSlotsAction,
    onSuccess: (data) => {
      if (data.success) {
        toast(data.success);
        setBookDialogOpen(false);
        router.refresh();
      } else {
        toast(data.error);
      }
    },
  });

  const handleBookSlot = () => {
    mutate({
      slotId,
    });
  };
  return (
    <Dialog
      open={bookDialogOpen && selectedSlotId === slotId}
      onOpenChange={(open) => {
        setBookDialogOpen(open);
        if (open) setSelectedSlotId(slotId);
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full">Book Consultation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Consultation</DialogTitle>
          <DialogDescription>
            Provide details about what you&apos;d like to discuss during the
            consultation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4"></div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setBookDialogOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleBookSlot}>
            {isPending ? "Loading..." : "Book slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
