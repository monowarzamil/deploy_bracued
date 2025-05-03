"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Course, Enrollment, Profile } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { createAttendanceWithRecords } from "./action";

type CourseWithFacultyAndEnrollment = Course & {
  faculty: Profile;
  Enrollment: (Enrollment & { student: Profile })[];
};

export default function TakeAttendanceForm({
  course,
  date,
  timeSchedule,
}: {
  course: CourseWithFacultyAndEnrollment;
  date: string;
  timeSchedule: string;
}) {
  const router = useRouter();
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, boolean>
  >(
    course.Enrollment.reduce(
      (acc, enrollment) => ({
        ...acc,
        [enrollment.student.id]: true,
      }),
      {}
    )
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: isPresent,
    }));
  };

  const handleSaveAttendance = async () => {
    setIsSubmitting(true);
    try {
      const result = await createAttendanceWithRecords({
        date: new Date(date),
        courseId: course.id,
        facultyId: course.faculty.id,
        timeSlot: timeSchedule,
        records: course.Enrollment.map((enrollment) => ({
          studentId: enrollment.student.id,
          status: attendanceStatus[enrollment.student.id] ?? true,
        })),
      });

      if (result.success) {
        alert("Submit successfully");
        router.push("/dashboard/attendance");
      } else {
        alert("Failed to save attendance: " + result.message);
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("An error occurred while saving attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalStudents = course.Enrollment.length;
  const absentCount = Object.values(attendanceStatus).filter(
    (status) => status === false
  ).length;
  const presentCount = totalStudents - absentCount;

  return (
    <div className="container mx-auto py-10">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.push("/dashboard/attendance")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Take Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium mb-1">Faculty Name</p>
              <p className="text-lg capitalize">{course.faculty.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Date</p>
              <p className="text-lg">{date}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Course Code</p>
              <p className="text-lg">{course.courseCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Section</p>
              <p className="text-lg">{course.section}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Course Title</p>
              <p className="text-lg">{course.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Time Schedule</p>
              <p className="text-lg">
                {timeSchedule?.replace("-", " - ").toUpperCase()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Serial</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {course.Enrollment.map((data, index) => (
              <TableRow key={data.student.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{data.student.name}</TableCell>
                <TableCell className="flex justify-end">
                  <Select
                    defaultValue="true"
                    onValueChange={(value) =>
                      handleAttendanceChange(data.student.id, value === "true")
                    }
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Present</SelectItem>
                      <SelectItem value="false">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Students
              </p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Present</p>
              <p className="text-2xl font-bold text-green-600">
                {presentCount}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Absent</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveAttendance} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
