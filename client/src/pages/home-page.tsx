import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Question, InsertQuestion, insertQuestionSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import QuestionCard from "@/components/question-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const form = useForm<InsertQuestion>({
    resolver: zodResolver(insertQuestionSchema),
  });

  const askQuestionMutation = async (question: InsertQuestion) => {
    const res = await apiRequest("POST", "/api/questions", question);
    return res.json();
  };

  const onSubmit = async (data: InsertQuestion) => {
    try {
      await askQuestionMutation(data);
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      form.reset();
      toast({
        title: "Question posted successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to post question",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Questions</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ask a Question</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Title"
                  {...form.register("title")}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Content"
                  className="min-h-[200px]"
                  {...form.register("content")}
                />
              </div>
              <Button type="submit" className="w-full">
                Post Question
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {questions?.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}
