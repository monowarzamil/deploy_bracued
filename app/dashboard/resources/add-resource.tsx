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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Course } from "@prisma/client";
import { Plus } from "lucide-react";
import React, { useState, useTransition } from "react";
import { addNewResourceAction } from "./actions";
import { toast } from "sonner";

interface FacultyViewProps {
  courses: Course[];
}

export default function AddResource({ courses }: FacultyViewProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "pdf",
    url: "",
    topic: "",
    courseId: "",
  });

  const [isPending, startTransition] = useTransition();

  const handleCreateResource = () => {
    const values = {
      title: newResource.title,
      description: newResource.description,
      type: newResource.type,
      url: newResource.url,
      topic: newResource.topic,
      courseId: newResource.courseId,
    };
    startTransition(async () => {
      const result = await addNewResourceAction(values);
      if (result?.error) {
        toast("Error message", { description: result.error });
      } else {
        toast("Success message", { description: result.success });
        setNewResource({
          title: "",
          description: "",
          type: "pdf",
          url: "",
          topic: "",
          courseId: "",
        });
        setCreateDialogOpen(false);
      }
    });
  };

  return (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogDescription>
            Upload a new resource for your students.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resourceTitle">Title</Label>
            <Input
              id="resourceTitle"
              value={newResource.title}
              onChange={(e) =>
                setNewResource({ ...newResource, title: e.target.value })
              }
              placeholder="e.g., Week 1 Lecture Notes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceDescription">Description (Optional)</Label>
            <Textarea
              id="resourceDescription"
              value={newResource.description}
              onChange={(e) =>
                setNewResource({
                  ...newResource,
                  description: e.target.value,
                })
              }
              placeholder="Brief description of the resource"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resourceType">Type</Label>
              <Select
                value={newResource.type}
                onValueChange={(value) =>
                  setNewResource({ ...newResource, type: value })
                }
              >
                <SelectTrigger id="resourceType" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceCourse">Course</Label>
              <Select
                value={newResource.courseId}
                onValueChange={(value) =>
                  setNewResource({ ...newResource, courseId: value })
                }
              >
                <SelectTrigger id="resourceCourse" className="w-full">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceTopic">Topic (Optional)</Label>
            <Input
              id="resourceTopic"
              value={newResource.topic}
              onChange={(e) =>
                setNewResource({ ...newResource, topic: e.target.value })
              }
              placeholder="e.g., Introduction, Data Structures"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceUrl">URL</Label>
            <Input
              id="resourceUrl"
              value={newResource.url}
              onChange={(e) =>
                setNewResource({ ...newResource, url: e.target.value })
              }
              placeholder="https://example.com/resource"
            />
            <p className="text-xs text-gray-500">
              Provide a link to the resource. For PDFs and videos, use a direct
              link or upload to a service like Google Drive and share the link.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleCreateResource}>
            {isPending ? "Loading..." : "Add Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
