"use client";

import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BookOpen, Plus, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { createCourseAction } from "./actions";
import { toast } from "sonner";
import { Course, Enrollment, Profile } from "@prisma/client";
import CourseCard from "./course-card";

const daysOfWeek = [
  { value: "MON", label: "Monday" },
  { value: "TUE", label: "Tuesday" },
  { value: "WED", label: "Wednesday" },
  { value: "THU", label: "Thursday" },
  { value: "SAT", label: "Saturday" },
  { value: "SUN", label: "Sunday" },
];
const timeSchedules = [
  { value: "8:00-9:30", label: "8:00 AM - 9:30 AM" },
  { value: "9:45-11:15", label: "9:45 AM - 11:15 AM" },
  { value: "11:30-1:00", label: "11:30 AM - 1:00 PM" },
  { value: "2:00-3:30", label: "2:00 PM - 3:30 PM" },
  { value: "3:45-5:15", label: "3:45 PM - 5:15 PM" },
  { value: "5:30-7:00", label: "5:30 PM - 7:00 PM" },
];
type CourseWithFacultyAndEnrollment = Course & {
  faculty: Pick<Profile, "name">;
  Enrollment: Enrollment[];
};
interface FacultyViewProps {
  role: string;
  courses: CourseWithFacultyAndEnrollment[];
}

export default function FacultyView({ role, courses }: FacultyViewProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    section: "",
    schedule: "",
    courseCode: "",
    credit: "",
  });

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleCreateCourse = () => {
    startTransition(async () => {
      const result = await createCourseAction({
        days: selectedDays,
        values: newCourse,
      });
      if (result.success) {
        toast(result.success);
        setNewCourse({
          title: "",
          description: "",
          schedule: "",
          courseCode: "",
          credit: "",
          section: "",
        });
        setSelectedDays([]);
      } else {
        toast(result.error);
      }
    });
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4 ">
        <div className="relative w-64 ">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 " />
          <Input
            placeholder="Search courses..."
            className="pl-8 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {role === "FACULTY" && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new course.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={newCourse.title}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, title: e.target.value })
                    }
                    placeholder="e.g., Introduction to Computer Science"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={newCourse.courseCode}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, courseCode: e.target.value })
                    }
                    placeholder="e.g., CSC 101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCode">section</Label>
                  <Input
                    id="courseCode"
                    value={newCourse.section}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, section: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit">Course Credit</Label>
                  <Input
                    id="credit"
                    value={newCourse.credit}
                    type="number"
                    min={1}
                    max={6}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, credit: e.target.value })
                    }
                    placeholder="e.g., 3 hours"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCourse.description}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                    }
                    placeholder="Provide a brief description of the course"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewCourse({ ...newCourse, schedule: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Time schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSchedules.map((item) => (
                        <SelectItem key={item.label} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="days">Days (select 2)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <Badge
                        key={day.value}
                        variant={
                          selectedDays.includes(day.value)
                            ? "default"
                            : "outline"
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
                <Button disabled={isPending} onClick={handleCreateCourse}>
                  {isPending ? "Loading..." : "Create Courses"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {filteredCourses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} role={role} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No courses found</h3>
          <p className="mt-2 text-gray-500">
            {searchQuery
              ? "No courses match your search criteria."
              : "You haven't created any courses yet."}
          </p>
        </div>
      )}
    </>
  );
}
