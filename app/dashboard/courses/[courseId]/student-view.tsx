"use client";

import { Assignment, Course, Submission } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Calendar,
  Download,
  FileText,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { submitAssignmentAction } from "./actions";
import { toast } from "sonner";

interface AssignmentWithSubmission extends Assignment {
  submissions: Submission[];
  course: Course;
}

interface StudentViewProps {
  assignments: AssignmentWithSubmission[];
  studentId: string;
}

export default function StudentView({
  assignments,
  studentId,
}: StudentViewProps) {
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  const getStudentSubmission = (assignment: AssignmentWithSubmission) => {
    return assignment.submissions.find((sub) => sub.studentId === studentId);
  };

  const handleSubmitAssignment = (assignmentId: string) => {
    startTransition(async () => {
      const result = await submitAssignmentAction({
        assignmentId,
        fileUrl: submissionUrl,
      });
      if (result?.error) {
        toast("Error message!", { description: result?.error });
      } else {
        toast("Success message.", { description: result?.success });
        setSubmissionDialogOpen(false);
        setSubmissionUrl("");
      }
    });
  };

  return (
    <>
      {assignments?.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const studentSubmission = getStudentSubmission(assignment);
            const isPastDue = new Date(assignment.dueDate) < new Date();
            const isSubmitted = !!studentSubmission;

            return (
              <Card
                key={assignment.id}
                className={cn(
                  isPastDue && !isSubmitted ? "border-red-300" : "",
                  isSubmitted ? "border-green-300" : ""
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Assignment {assignment.assignmentNumber}:{" "}
                        {assignment.title}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {assignment.course.title}
                          </Badge>
                          {assignment.topic && (
                            <Badge variant="secondary" className="text-xs">
                              {assignment.topic}
                            </Badge>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        isPastDue
                          ? isSubmitted
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          : isSubmitted
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      )}
                    >
                      {isSubmitted
                        ? "Submitted"
                        : isPastDue
                        ? "Past Due"
                        : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {assignment.description}
                    </p>

                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                      <span>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    {isSubmitted && studentSubmission && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Your Submission</p>
                          <span className="text-xs text-gray-500">
                            {new Date(
                              studentSubmission.submittedAt
                            ).toLocaleString()}
                          </span>
                        </div>

                        <a
                          href={studentSubmission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center"
                        >
                          <Download className="mr-1 h-4 w-4" />
                          View Your Submission
                        </a>

                        {studentSubmission.grade !== null && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Grade</p>
                              <Badge
                                className={cn(
                                  studentSubmission.grade! >= 70
                                    ? "bg-green-100 text-green-800"
                                    : "bg-amber-100 text-amber-800"
                                )}
                              >
                                {studentSubmission.grade}/100
                              </Badge>
                            </div>

                            {studentSubmission.feedback && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                                <p className="font-medium">Feedback:</p>
                                <p className="text-gray-600">
                                  {studentSubmission.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {isPastDue && !isSubmitted && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          The deadline for this assignment has passed.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {!isSubmitted && !isPastDue ? (
                    <Dialog
                      open={
                        submissionDialogOpen &&
                        selectedAssignmentId === assignment.id
                      }
                      onOpenChange={(open) => {
                        setSubmissionDialogOpen(open);
                        if (open) setSelectedAssignmentId(assignment.id);
                        else setSubmissionUrl("");
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Assignment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Assignment</DialogTitle>
                          <DialogDescription>
                            Upload your assignment submission.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="submissionUrl">
                              Submission URL
                            </Label>
                            <Input
                              id="submissionUrl"
                              value={submissionUrl}
                              onChange={(e) => setSubmissionUrl(e.target.value)}
                              placeholder="https://drive.google.com/file/..."
                            />
                            <p className="text-xs text-gray-500">
                              Upload your file to Google Drive, Dropbox, or
                              another file sharing service and paste the link
                              here.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setSubmissionDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={isPending || !submissionUrl}
                            onClick={() =>
                              handleSubmitAssignment(assignment.id)
                            }
                          >
                            {isPending ? "Submitting..." : "Submit"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      {isSubmitted ? "Already Submitted" : "Deadline Passed"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No assignments found</h3>
        </div>
      )}
    </>
  );
}
