"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema";
import envConfig from "@/config";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const { toast } = useToast();

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_API_ENDPOINT);
  }, []);

  // 1. Define your form.
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: LoginBodyType) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(process.env.NEXT_PUBLIC_API_ENDPOINT);
    try {
      const result = await fetch(
        `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/auth/login`,
        {
          body: JSON.stringify(values),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      ).then(async (res) => {
        const payload = await res.json();
        const data = {
          status: res.status,
          payload,
        };
        console.log("res", res);
        console.log("payload", payload);
        console.log("data", data);

        if (!res.ok) {
          throw data;
        }
        toast({
          title: "Success",
          description: data.payload.message,
        });
        return data;
      });
    } catch (error: any) {
      console.log("error", error);
      const errors = error.payload.errors as {
        field: string;
        message: string;
      }[];

      console.log(errors);
      const status = error.status as number;
      if (status === 422) {
        errors.forEach((error) => {
          form.setError(error.field as "email" | "password", {
            type: "server",
            message: error.message,
          });
        });
      } else {
        toast({
          title: "Error",
          description: error.payload.message,
        });
      }
    }
    // console.log(result);
  }
  return (
    <>
      <h1 className="text-xl font-semibold text-center">Login</h1>
      <div className="w-full flex justify-center items-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (error) =>
              console.log("er", error)
            )}
            className="space-y-2 max-w-[600px] w-full"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
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
                    <Input type="password" placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </>
  );
};
export default LoginForm;
