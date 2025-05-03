import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { BookOpen, FileText, MessageSquareText } from "lucide-react";

export default async function Home() {
  const session = await auth();
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">BracuEd</h1>

          {session?.user ? (
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          ) : (
            <div className="space-x-2">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Welcome to the Learning Management System
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A comprehensive platform for faculty and students to manage courses,
            resources, and assignments.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Course Management</h3>
              <p className="text-gray-600">
                Create, manage, and enroll in courses with ease.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Resources & Assignments
              </h3>
              <p className="text-gray-600">
                Access learning materials and submit assignments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquareText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Communication</h3>
              <p className="text-gray-600">
                Book consultations and get instant assistance via chatbot.
              </p>
            </div>
          </div>

          <Link href={session?.user ? "/dashboard" : "/login"}>
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </main>

      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} Learning Management System. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
