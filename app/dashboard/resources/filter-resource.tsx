"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookMark, Course, Resource } from "@prisma/client";
import { FileText, Search } from "lucide-react";
import React, { useState } from "react";
import ResourceCard from "./resource-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ResourceWithBookmarks = Resource & { bookMarks: BookMark[] };

interface FilterResourceProps {
  userId: string;
  courses: Course[];
  role: string;
  availableResources: ResourceWithBookmarks[];
}

export default function FilterResource({
  courses,
  role,
  availableResources,
  userId,
}: FilterResourceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const filteredAvailableResources = availableResources?.filter((resource) => {
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse
      ? resource.courseId ===
        courses.find((c) => c.title === selectedCourse)?.id
      : true;
    return matchesSearch && matchesCourse;
  });

  const bookMarked = availableResources.filter((resource) =>
    resource.bookMarks.some((b) => b.profileId === userId)
  );

  const filteredMarkedResources = bookMarked?.filter((resource) => {
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse
      ? resource.courseId ===
        courses.find((c) => c.title === selectedCourse)?.id
      : true;
    return matchesSearch && matchesCourse;
  });

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCourse(null);
  };

  return (
    <div className="flex flex-col  gap-4">
      <div className="flex  items-end gap-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search resources..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-x-3">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Course</p>
            <Select
              value={selectedCourse || ""}
              onValueChange={(value) => setSelectedCourse(value || null)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem
                    className="capitalize"
                    key={course.id}
                    value={course.title}
                  >
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="button" onClick={handleReset} variant={"outline"}>
          Reset
        </Button>
      </div>

      <div className="flex-1">
        {role === "STUDENT" ? (
          <>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="book-mark">Book mark</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                {filteredAvailableResources.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAvailableResources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        role={role}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">
                      No resources found
                    </h3>
                    <p className="mt-2 text-gray-500">
                      {searchQuery
                        ? "No resources match your search criteria."
                        : "There are no resources available for this course yet."}
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="book-mark">
                {filteredMarkedResources.length > 0 ? (
                  <div className="space-y-4">
                    {filteredMarkedResources.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        role={role}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">
                      No resources found
                    </h3>
                    <p className="mt-2 text-gray-500">
                      {searchQuery
                        ? "No resources match your search criteria."
                        : "There are no resources available for this course yet."}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            {filteredAvailableResources.length > 0 ? (
              <div className="space-y-4">
                {filteredAvailableResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    role={role}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No resources found</h3>
                <p className="mt-2 text-gray-500">
                  {searchQuery
                    ? "No resources match your search criteria."
                    : "You haven't added any resources yet."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
