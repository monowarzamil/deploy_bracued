"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { useMutation } from "@tanstack/react-query";
import ErrorMessage from "../../components/error-message";
import SuccessMessage from "../../components/success-message";
import {
  signUpFormSchema,
  TSignUpFormSchema,
} from "@/lib/zod-validation/auth-schema";
import { RegisterAction } from "@/app/register/action";

export default function RegisterForm() {
  const form = useForm<TSignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userRole: "STUDENT",
    },
  });

  const { mutate, data, isPending } = useMutation({
    mutationKey: ["register"],
    mutationFn: RegisterAction,
    onSuccess: (data) => {
      if (data.success) {
        form.reset();
      }
    },
  });

  function onSubmit(values: z.infer<typeof signUpFormSchema>) {
    mutate(values);
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image src={Logo} alt="logo" fill />
          </div>
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>
            Create a new account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userRole"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>User Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value: "STUDENT" | "FACULTY") => {
                          field.onChange(value);
                        }}
                        defaultValue={field.value}
                        className="flex  space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="STUDENT" />
                          </FormControl>
                          <FormLabel className="font-normal">Student</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="FACULTY" />
                          </FormControl>
                          <FormLabel className="font-normal">Faculty</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? "Loading..." : "Register"}
              </Button>
              {data?.error && <ErrorMessage message={data.error} />}
              {data?.success && <SuccessMessage message={data.success} />}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
