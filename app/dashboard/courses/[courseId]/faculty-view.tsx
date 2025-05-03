"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Assignment, Course, Profile, Submission } from "@prisma/client";
import { Calendar, Download, FileText, User } from "lucide-react";
import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { gradeSubmissionAction } from "./actions";
import { toast } from "sonner";

type SubmissionWithStudent = Submission & {
  student: Pick<Profile, "name">;
};

type AssignmentWithCourseWithSubmission = Assignment & {
  course: Course;
  submissions: SubmissionWithStudent[];
};

interface FacultyViewProps {
  assignments: AssignmentWithCourseWithSubmission[];
}

export default function FacultyView({ assignments }: FacultyViewProps) {
  const [submissions, setSubmissions] = useState<SubmissionWithStudent[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithStudent | null>(null);
  const [gradeDetails, setGradeDetails] = useState({
    grade: 0,
    feedback: "",
  });
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleViewSubmissions = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      setSubmissions(assignment.submissions);
    }
  };

  const handleGradeSubmission = () => {
    if (!selectedSubmission) return;

    startTransition(async () => {
      const result = await gradeSubmissionAction({
        feedback: gradeDetails.feedback,
        grade: gradeDetails.grade,
        submissionId: selectedSubmission.id,
      });

      if (result?.error) {
        toast("Error message!", { description: result.error });
      } else {
        toast("Success message.", { description: result?.success });
        setGradeDialogOpen(false);
        setSubmissions([]);
      }
    });
  };

  return (
    <>
      {assignments?.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
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
                      new Date(assignment.dueDate) < new Date()
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    )}
                  >
                    {new Date(assignment.dueDate) < new Date()
                      ? "Past Due"
                      : "Active"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {assignment.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                      <span>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1 h-4 w-4 text-gray-500" />
                      <span>
                        {assignment.submissions.length} submission
                        {assignment.submissions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewSubmissions(assignment.id)}
                  disabled={assignment.submissions.length === 0}
                >
                  View Submissions
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No assignments found</h3>
        </div>
      )}

      <Dialog
        open={submissions.length > 0}
        onOpenChange={(open) => !open && setSubmissions([])}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assignment Submissions</DialogTitle>
            <DialogDescription>
              Review and grade student submissions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {submission.student.name}
                      </CardTitle>
                      <CardDescription>
                        Submitted:{" "}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <Download className="mr-1 h-4 w-4" />
                          View Submission
                        </a>
                        {submission.grade !== null ? (
                          <Badge className="bg-green-100 text-green-800">
                            Grade: {submission.grade}/100
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Graded</Badge>
                        )}
                      </div>
                      {submission.feedback && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Feedback:</p>
                          <p className="text-gray-600">{submission.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant={
                          submission.grade !== null ? "outline" : "default"
                        }
                        className="w-full"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setGradeDetails({
                            grade: submission.grade || 0,
                            feedback: submission.feedback || "",
                          });
                          setGradeDialogOpen(true);
                        }}
                      >
                        {submission.grade !== null
                          ? "Update Grade"
                          : "Grade Submission"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No submissions yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Provide a grade and feedback for{" "}
              {selectedSubmission?.student?.name} submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade (out of 100)</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                value={gradeDetails.grade}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value) || 0;
                  setGradeDetails({
                    ...gradeDetails,
                    grade: Math.min(100, Math.max(0, value)),
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={gradeDetails.feedback}
                onChange={(e) =>
                  setGradeDetails({ ...gradeDetails, feedback: e.target.value })
                }
                placeholder="Provide feedback on the submission"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGradeSubmission}
              disabled={!selectedSubmission || isPending}
            >
              Save Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
