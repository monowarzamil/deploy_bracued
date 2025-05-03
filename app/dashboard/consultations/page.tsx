import { auth } from "@/auth";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/prisma";
import { Calendar, Clock, User } from "lucide-react";
import React from "react";
import CreateConsultationSlot from "./create-consultation-slot";
import BookConsultationSlot from "./book-consultation-slot";
import CancelConsultation from "./cancel-consultation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default async function Consultations() {
  const session = await auth();
  const user = await db.profile.findUnique({
    where: {
      id: session?.user.id,
    },
  });

  let consultations = [];
  if (user?.role === "FACULTY") {
    consultations = await db.consultationSlot.findMany({
      where: {
        facultyId: user.id,
      },
      include: {
        students: true,
        faculty: {
          select: {
            name: true,
          },
        },
        booking: {
          where: {
            studentId: user?.id,
          },
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  } else {
    consultations = await db.consultationSlot.findMany({
      where: {
        students: {
          some: {
            id: user?.id,
          },
        },
      },
      include: {
        faculty: {
          select: {
            name: true,
          },
        },
        students: true,
        booking: {
          where: {
            studentId: user?.id,
          },
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  const availableSlots = await db.consultationSlot.findMany({
    where: {
      students: {
        none: {
          id: session?.user.id,
        },
      },
    },
    include: {
      faculty: {
        select: {
          name: true,
        },
      },
      students: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return (
    <div>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">
            {user?.role === "FACULTY"
              ? "Manage Consultation Slots"
              : "Faculty Consultations"}
          </h2>
        </div>
        {user?.role === "FACULTY" && <CreateConsultationSlot />}

        {user?.role === "STUDENT" ? (
          <Tabs defaultValue="booked">
            <TabsList className="mb-4">
              <TabsTrigger value="booked">My Consultations</TabsTrigger>
              <TabsTrigger value="available">Available Slots</TabsTrigger>
            </TabsList>

            <TabsContent value="booked">
              {consultations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {consultations.map((slot) => (
                    <Card key={slot.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Consultation</span>
                          <span
                            className={cn(
                              "capitalize text-xs font-normal rounded p-1",
                              slot.booking[0].status === "pending"
                                ? "bg-yellow-100 text-yellow-500"
                                : slot.booking[0].status === "confirmed"
                                ? "bg-green-100 text-green-500"
                                : slot.booking[0].status === "rejected"
                                ? "bg-red-100 text-red-500"
                                : ""
                            )}
                          >
                            {slot.booking[0].status}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center text-sm mt-1 space-x-1">
                            <h2>Course:</h2>
                            <p>{slot.courseCode?.toUpperCase()}</p>
                          </div>
                          <div className="flex items-center text-sm">
                            <User className="mr-1 h-3 w-3" />
                            Faculty: {slot.faculty.name}
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(slot.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            <User className="mr-1 h-3 w-3" />
                            Students: {slot.students.length}
                          </div>
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No consultations booked
                  </h3>
                  <p className="mt-2 text-gray-500">
                    You haven&apos;t booked any consultations with faculty yet.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="available">
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableSlots.map((slot) => (
                    <Card key={slot.id}>
                      <CardHeader>
                        <CardTitle>Available Slot</CardTitle>
                        <CardDescription>
                          <div className="flex items-center text-sm mt-1 space-x-1">
                            <h2>Course:</h2>
                            <p>{slot.courseCode?.toUpperCase()}</p>
                          </div>
                          <div className="flex items-center text-sm">
                            <User className="mr-1 h-3 w-3" />
                            Faculty: {slot.faculty.name}
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(slot.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="flex items-center text-sm mt-1">
                            <User className="mr-1 h-3 w-3" />
                            Students: {slot.students.length}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <BookConsultationSlot slotId={slot.id} />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No available slots
                  </h3>
                  <p className="mt-2 text-gray-500">
                    There are no available consultation slots at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // Faculty view
          <>
            {consultations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consultations.map((slot) => (
                  <Card key={slot.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Consultation Slot</span>
                      </CardTitle>
                      <Separator />
                      <CardDescription>
                        <div className="flex items-center text-sm mt-1 space-x-1">
                          <h2>Course:</h2>
                          <p>{slot.courseCode?.toUpperCase()}</p>
                        </div>
                        <div className="flex items-center text-sm mt-1 space-x-1">
                          <h2>Room number:</h2>
                          <p>{slot.room}</p>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <Calendar className="mr-1 h-3 w-3" />
                          {slot.days[0]}-{slot.days[1]}
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(slot.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <Clock className="mr-1 h-3 w-3" />
                          {slot.startTime} - {slot.endTime}
                        </div>

                        <div className="flex items-center text-sm mt-1">
                          <User className="mr-1 h-3 w-3" />
                          Students: {slot.students.length}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CancelConsultation slotId={slot.id} />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">
                  No consultation slots
                </h3>
                <p className="mt-2 text-gray-500">
                  You haven&apos;t created any consultation slots yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
