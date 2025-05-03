"use client";
import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { createConsultationSlotsAction } from "./actions";
import { Badge } from "@/components/ui/badge";

const daysOfWeek = [
  { value: "MON", label: "Monday" },
  { value: "TUE", label: "Tuesday" },
  { value: "WED", label: "Wednesday" },
  { value: "THU", label: "Thursday" },
  { value: "SAT", label: "Saturday" },
  { value: "SUN", label: "Sunday" },
];

export default function CreateConsultationSlot() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: new Date(),
    startTime: "",
    endTime: "",
    courseCode: "",
    room: "",
  });
  const handleDaySelect = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      if (selectedDays.length < 2) {
        setSelectedDays([...selectedDays, day]);
      } else {
        setSelectedDays([selectedDays[1], day]);
      }
    }
  };
  const [isPending, startTransition] = useTransition();
  const handleCreateSlot = async () => {
    startTransition(async () => {
      const result = await createConsultationSlotsAction({
        values: newSlot,
        days: selectedDays,
      });
      if (result.error) {
        toast(result.error);
      } else {
        toast(result.success);
        setNewSlot({
          date: new Date(),
          startTime: "",
          endTime: "",
          courseCode: "",
          room: "",
        });
        setSelectedDays([]);
      }
    });
  };

  return (
    <div>
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4" />
            Create Slot
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Consultation Slot</DialogTitle>
            <DialogDescription>
              Set up a time slot when you&apos;re available for student
              consultations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course code</Label>
              <Input
                id="courseCode"
                value={newSlot.courseCode}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, courseCode: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Room number</Label>
              <Input
                id="room"
                value={newSlot.room}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, room: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start  font-normal",
                      !newSlot.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newSlot.date ? (
                      format(newSlot.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newSlot.date}
                    onSelect={(date) =>
                      date && setNewSlot({ ...newSlot, date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="days">Days (select 2)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Badge
                    key={day.value}
                    variant={
                      selectedDays.includes(day.value) ? "default" : "outline"
                    }
                    className={cn(
                      "cursor-pointer capitalize",
                      selectedDays.includes(day.value)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-background hover:bg-muted"
                    )}
                    onClick={() => handleDaySelect(day.value)}
                  >
                    {day.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending} onClick={handleCreateSlot}>
              {isPending ? "Loading..." : "Create Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
