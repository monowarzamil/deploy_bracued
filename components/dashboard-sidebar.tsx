import Link from "next/link";
import React from "react";

import {
  BookOpen,
  Calendar,
  FileText,
  Home,
  MessageSquare,
  User,
} from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { LogOut } from "./auth/logout";

export default async function DashboardSidebar() {
  const session = await auth();
  const user = await db.profile.findUnique({
    where: {
      id: session?.user.id,
    },
  });

  if (!user) return;

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
    { name: "Resources", href: "/dashboard/resources", icon: FileText },
    { name: "Consultations", href: "/dashboard/consultations", icon: Calendar },
    ...(user.role === "FACULTY"
      ? [{ name: "Attendance", href: "/dashboard/attendance", icon: User }]
      : []),
    { name: "Chat Support", href: "/dashboard/chat", icon: MessageSquare },
  ];

  return (
    <div className="fixed h-screen flex flex-col w-64 border-r border-gray-200 bg-white z-50 top-0 left-0">
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b shrink-0">
        <h2 className="text-xl font-bold text-blue-600">BracuEd</h2>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav aria-label="Main navigation" className="px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-gray-700 group"
            >
              <item.icon
                className="h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-gray-700"
                aria-hidden="true"
              />
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t shrink-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {user.name.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium truncate ">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize truncate">
              {user.role}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <LogOut />
        </div>
      </div>
    </div>
  );
}
