"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentAttendanceTableProps {
  enrollments: {
    id: string;
    student: {
      id: string;
      name: string;
    };
  }[];
  attendanceRecords: {
    id: string;
    date: Date;
    records: {
      studentId: string;
      status: boolean;
    }[];
  }[];
}

export function StudentAttendanceTable({
  enrollments,
  attendanceRecords,
}: StudentAttendanceTableProps) {
  // Calculate attendance stats for each student
  const studentStats = enrollments.map((enrollment) => {
    const studentRecords = attendanceRecords.flatMap((session) =>
      session.records.filter((r) => r.studentId === enrollment.student.id)
    );

    const presentCount = studentRecords.filter((r) => r.status).length;
    const absentCount = studentRecords.length - presentCount;
    const attendancePercentage =
      studentRecords.length > 0
        ? Math.round((presentCount / studentRecords.length) * 100)
        : 0;

    return {
      studentId: enrollment.student.id,
      studentName: enrollment.student.name,
      presentCount,
      absentCount,
      attendancePercentage,
      records: studentRecords,
    };
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead className="text-center">Present</TableHead>
            <TableHead className="text-center">Absent</TableHead>
            <TableHead className="text-center">Attendance %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentStats.map((stat) => (
            <TableRow key={stat.studentId}>
              <TableCell className="font-medium">{stat.studentName}</TableCell>
              <TableCell className="text-center text-green-600">
                {stat.presentCount}
              </TableCell>
              <TableCell className="text-center text-red-600">
                {stat.absentCount}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  <span className="mr-2">{stat.attendancePercentage}%</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
