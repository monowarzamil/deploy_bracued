import Link from "next/link";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import FilterCourse from "./filter-course";

export default async function AttendancePage() {
  const session = await auth();

  const courses = await db.course.findMany({
    where: {
      facultyId: session?.user.id,
    },
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6"> Attendance </h1>

      <div className="rounded-md border mb-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>

              <TableHead className="w-[200px]">Course Code</TableHead>
              <TableHead className="w-[200px]">Section</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium capitalize">
                  {course.title}
                </TableCell>
                <TableCell>{course.courseCode.toUpperCase()}</TableCell>
                <TableCell>{course.section}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/attendance/${course.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Attendance
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <FilterCourse courses={courses} />
    </div>
  );
}
