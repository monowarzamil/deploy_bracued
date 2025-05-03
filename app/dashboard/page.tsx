import { auth } from "@/auth";
import ChangeStatus from "@/components/change-status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/prisma";
import { relativeData } from "@/lib/utils";
import {
  Bell,
  Bookmark,
  BookOpen,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();

  const notifications = await db.notification.findMany({
    where: {
      Course: {
        Enrollment: {
          some: {
            studentId: session?.user.id,
          },
        },
      },
    },
    include: {
      Course: {
        select: {
          courseCode: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const user = await db.profile.findUnique({
    where: {
      id: session?.user.id,
    },
  });

  const pendingRequest = await db.consultationSlot.findMany({
    where: {
      facultyId: user?.id,
      booking: {
        some: {
          status: "pending",
        },
      },
    },
    include: {
      students: true,
    },
  });

  let courses = [];
  if (user?.role === "FACULTY") {
    courses = await db.course.findMany({
      where: {
        facultyId: user?.id,
        faculty: {
          role: "FACULTY",
        },
      },
      include: {
        faculty: true,
      },
    });
  } else {
    courses = await db.course.findMany({
      where: {
        Enrollment: {
          some: {
            studentId: session?.user.id,
          },
        },
      },
    });
  }

  const today = new Date();

  const assignments = await db.assignment.findMany({
    where: {
      dueDate: {
        gt: today,
      },
      course: {
        Enrollment: {
          some: {
            studentId: session?.user.id,
          },
        },
      },
    },
    include: {
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 5,
  });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-gray-600">
              {user?.role === "FACULTY"
                ? "Manage your courses, assignments, and student consultations."
                : "Access your courses, assignments, and book faculty consultations."}
            </p>
          </CardContent>
        </Card>

        {/* Courses Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
              My Courses
            </CardTitle>
            <CardDescription>
              {user?.role === "FACULTY"
                ? "Courses you teach"
                : "Courses you're enrolled in"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <ul className="space-y-1">
                {courses.slice(0, 3).map((course) => (
                  <li
                    key={course.id}
                    className="px-2 py-1 rounded hover:bg-gray-100 flex items-center space-x-1"
                  >
                    <Bookmark className="w-4 h-4 text-orange-400" />
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="block"
                    >
                      <h3 className="font-medium text-sm capitalize">
                        {course.title}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm py-2">
                {user?.role === "FACULTY"
                  ? "You haven't created any courses yet."
                  : "You're not enrolled in any courses yet."}
              </p>
            )}
            <div className="mt-4">
              <Link href="/dashboard/courses">
                <Button variant="outline" size="sm" className="w-full">
                  {user?.role === "FACULTY"
                    ? courses.length > 0
                      ? "Manage Courses"
                      : "Create Course"
                    : courses.length > 0
                    ? "View All Courses"
                    : "Browse Courses"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-green-500" />
              Upcoming Assignments
            </CardTitle>
            <CardDescription>Assignments due soon</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length > 0 ? (
              <ul className="space-y-2">
                {assignments.slice(0, 3).map((assignment) => (
                  <li
                    key={assignment.id}
                    className="p-2 rounded hover:bg-gray-50"
                  >
                    <Link href={`#`} className="block">
                      <h3 className="font-medium capitalize">
                        {assignment.title}
                      </h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">
                          {assignment.course.title}
                        </span>
                        <span className="flex items-center text-amber-600">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm py-2">
                No upcoming assignments.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Consultations Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-purple-500" />
              {user?.role === "FACULTY"
                ? "Consultation Requests"
                : "Faculty Consultations"}
            </CardTitle>
            <CardDescription>
              {user?.role === "FACULTY"
                ? "Student consultation requests"
                : "Book time with faculty"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm py-2">
              {user?.role === "FACULTY"
                ? "No pending consultation requests."
                : "Book consultation slots with your faculty."}
            </p>
            <div className="mt-4">
              <Link href="/dashboard/consultations">
                <Button variant="outline" size="sm" className="w-full">
                  {user?.role === "FACULTY"
                    ? "Manage Consultations"
                    : "Book Consultation"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-blue-500" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user?.role === "FACULTY" ? (
            pendingRequest.length > 0 ? (
              <ul className="space-y-2">
                {pendingRequest.map((notification) => (
                  <li
                    key={notification.id}
                    className="p-3 rounded border-l-4  border-blue-200 bg-gray-50 shadow"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">
                        {notification.students[0].name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Request to join your{" "}
                        <span className="font-bold px-1">
                          {notification.courseCode}
                        </span>
                        consultations.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {relativeData(notification.createdAt)}
                      </p>
                      <div className="flex items-center gap-x-2">
                        <ChangeStatus
                          slotId={notification.id}
                          studentId={notification.students[0].id}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm py-2">
                No new notifications.
              </p>
            )
          ) : notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="p-3 rounded border-l-4 flex justify-between  border-blue-200 bg-gray-50 shadow"
                >
                  <div className="flex flex-col ">
                    <h3 className="font-medium">
                      {notification.title}-{notification.Course?.courseCode}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {relativeData(notification.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm py-2">No new notifications.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
