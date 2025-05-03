"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course, Enrollment, Profile } from "@prisma/client";
import { BookOpen, Calendar, Search, User } from "lucide-react";
import { useState, useTransition } from "react";
import CourseCard from "./course-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { enrollCourseAction } from "./actions";
import { toast } from "sonner";

type CourseWithBasicFaculty = Course & {
  faculty: Pick<Profile, "name">;
};

type CourseWithFacultyAndEnrollments = Course & {
  faculty: Pick<Profile, "name">;
  Enrollment: Enrollment[];
};

interface StudentViewProps {
  myCourses: CourseWithFacultyAndEnrollments[];
  availableCourses: CourseWithBasicFaculty[];
  role: string;
}

export default function StudentView({
  myCourses,
  availableCourses,
  role,
}: StudentViewProps) {
  const [enrollmentId, setEnrollmentId] = useState("");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredMyCourses = myCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredAvailableCourses = availableCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEnrollRequest = () => {
    console.log({ selectedCourseId, enrollmentId });
    startTransition(async () => {
      const result = await enrollCourseAction({
        courseId: selectedCourseId,
        studentId: enrollmentId,
      });

      if (result.success) {
        toast("Success message", { description: result.success });
        setEnrollmentId("");
        setSelectedCourseId("");
        setEnrollDialogOpen(false);
      } else {
        toast("Error message", { description: result.error });
      }
    });
  };

  return (
    <div>
      <div className="relative w-full ">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search courses..."
          className="pl-8 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="enrolled">
        <TabsList className="my-4">
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="available">Available Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          {filteredMyCourses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyCourses.map((course) => (
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
                  : "You are not enrolled in any courses yet."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available">
          {filteredAvailableCourses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailableCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="capitalize">{course.title}</CardTitle>
                    <Separator />
                    <CardDescription>
                      <div className="flex items-center text-sm">
                        Course code: {course.courseCode.toUpperCase()}
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="mr-1 h-3 w-3" />
                        Faculty: {course.faculty.name}
                      </div>
                      <div className="flex items-center text-sm mt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        {course.days[0]}-{course.days[1]}
                      </div>
                      <div className="flex items-center text-sm mt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        {course.schedule}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {course.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Dialog
                      open={enrollDialogOpen && selectedCourseId === course.id}
                      onOpenChange={(open) => {
                        setEnrollDialogOpen(open);
                        if (open) setSelectedCourseId(course.id);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Enroll in Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Enroll in {course.title}</DialogTitle>
                          <DialogDescription>
                            Please enter your Student ID to verify enrollment
                            eligibility.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input
                              id="studentId"
                              value={enrollmentId}
                              onChange={(e) => setEnrollmentId(e.target.value)}
                              placeholder="e.g., S12345"
                            />
                            <p className="text-xs text-gray-500">
                              Your ID will be verified against the course
                              enrollment list.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setEnrollDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={isPending}
                            onClick={handleEnrollRequest}
                          >
                            {isPending ? "Loading..." : "Submit Enrollment"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No available courses</h3>
              <p className="mt-2 text-gray-500">
                {searchQuery
                  ? "No courses match your search criteria."
                  : "There are no available courses to enroll in at the moment."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
