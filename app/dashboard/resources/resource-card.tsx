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
import { BookMark, Resource } from "@prisma/client";

import {
  Bookmark,
  ExternalLink,
  File,
  FileText,
  Link2,
  Loader2,
  Trash,
  Video,
} from "lucide-react";
import { useTransition } from "react";
import { bookMarkAction, deleteResourceAction } from "./actions";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type ResourceWithBookmarks = Resource & { bookMarks: BookMark[] };

export default function ResourceCard({
  resource,
  role,
}: {
  resource: ResourceWithBookmarks;
  role: string;
}) {
  const { data: session } = useSession();

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "link":
        return <ExternalLink className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const [isPending, startTransition] = useTransition();

  const handleBookMark = (resourceId: string) => {
    if (role === "FACULTY") {
      startTransition(async () => {
        const res = await deleteResourceAction({ resourceId });
        if (res.error) {
          toast("Error message", { description: res.error });
        } else {
          toast("Success message", { description: res.success });
        }
      });
    } else {
      startTransition(async () => {
        const res = await bookMarkAction({ resourceId });
        if (res.error) {
          toast("Error message", { description: res.error });
        } else {
          toast("Success message", { description: res.success });
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {getResourceIcon(resource.type)}
            <CardTitle className="ml-2 text-lg">{resource.title}</CardTitle>
          </div>
          <button type="button" onClick={() => handleBookMark(resource.id)}>
            {isPending ? (
              <Loader2 className="animate-spin text-blue-600" />
            ) : (
              <div>
                {role === "FACULTY" ? (
                  <Trash className="text-red-500 " />
                ) : (
                  <Bookmark
                    className={cn(
                      resource.bookMarks.some(
                        (bookmark) => bookmark.profileId === session?.user.id
                      )
                        ? "text-blue-500"
                        : "text-gray-500"
                    )}
                  />
                )}
              </div>
            )}
          </button>
        </div>
        <CardDescription>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {resource.title}
            </Badge>
            {resource.topic && (
              <Badge variant="secondary" className="text-xs">
                {resource.topic}
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              Added: {new Date(resource.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resource.description && (
          <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
        )}
      </CardContent>
      <CardFooter>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button variant="outline" className="w-full">
            <Link2 className="mr-2 h-4 w-4" />
            {resource.type === "pdf"
              ? "View PDF"
              : resource.type === "video"
              ? "Watch Video"
              : "Open Link"}
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
