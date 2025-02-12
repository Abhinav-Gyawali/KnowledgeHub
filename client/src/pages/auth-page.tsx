import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { InsertUser, insertUserSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Welcome to DevQ&A</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="flex-1 bg-primary text-primary-foreground p-12 hidden lg:flex flex-col justify-center">
        <h1 className="text-4xl font-bold mb-6">
          Get answers to your technical questions
        </h1>
        <p className="text-lg mb-8">
          Join our community of developers helping each other solve programming
          challenges.
        </p>
        <ul className="space-y-4">
          <li>✓ Ask questions and get expert answers</li>
          <li>✓ Share your knowledge with others</li>
          <li>✓ Build your reputation in the community</li>
        </ul>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
      className="space-y-4 mt-4"
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input {...form.register("username")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input type="password" {...form.register("password")} />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))}
      className="space-y-4 mt-4"
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input {...form.register("username")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input type="password" {...form.register("password")} />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Register"
        )}
      </Button>
    </form>
  );
}
