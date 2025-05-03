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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { addAssignmentAction } from "./actions";
import { toast } from "sonner";

export default function AddAssignment({ courseId }: { courseId: string }) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    assignmentNumber: 1,
    dueDate: new Date(),
    topic: "",
  });
  const [isPending, startTransition] = useTransition();

  const handleCreateAssignment = () => {
    const values = {
      title: newAssignment.title,
      description: newAssignment.description,
      assignmentNumber: newAssignment.assignmentNumber,
      dueDate: newAssignment.dueDate,
      topic: newAssignment.topic,
      courseId,
    };
    startTransition(async () => {
      const result = await addAssignmentAction(values);
      if (result?.error) {
        toast("Error message!", { description: result?.error });
      } else {
        toast("Success message.", { description: result?.success });
        setNewAssignment({
          title: "",
          description: "",
          assignmentNumber: 1,
          dueDate: new Date(),
          topic: "",
        });
        setCreateDialogOpen(false);
      }
    });
  };

  return (
    <div>
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for your students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignmentTitle">Title</Label>
              <Input
                id="assignmentTitle"
                value={newAssignment.title}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, title: e.target.value })
                }
                placeholder="e.g., Midterm Project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignmentDescription">Description</Label>
              <Textarea
                id="assignmentDescription"
                value={newAssignment.description}
                onChange={(e) =>
                  setNewAssignment({
                    ...newAssignment,
                    description: e.target.value,
                  })
                }
                placeholder="Detailed instructions for the assignment"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignmentNumber">Assignment Number</Label>
                <Input
                  id="assignmentNumber"
                  type="number"
                  min="1"
                  value={newAssignment.assignmentNumber}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      assignmentNumber: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignmentTopic">Topic (Optional)</Label>
              <Input
                id="assignmentTopic"
                value={newAssignment.topic}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, topic: e.target.value })
                }
                placeholder="e.g., Data Structures, Algorithms"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newAssignment.dueDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newAssignment.dueDate ? (
                      format(newAssignment.dueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newAssignment.dueDate}
                    onSelect={(date) =>
                      date &&
                      setNewAssignment({ ...newAssignment, dueDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending} onClick={handleCreateAssignment}>
              {isPending ? "Loading..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
