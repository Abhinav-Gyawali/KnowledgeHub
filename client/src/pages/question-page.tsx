import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Question, Answer, Comment, insertAnswerSchema, insertCommentSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";
import QuestionCard from "@/components/question-card";
import AnswerCard from "@/components/answer-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuestionPage() {
  const { id } = useParams();
  const { toast } = useToast();
  
  const { data: question, isLoading: questionLoading } = useQuery<Question>({
    queryKey: [`/api/questions/${id}`],
  });

  const { data: answers, isLoading: answersLoading } = useQuery<Answer[]>({
    queryKey: [`/api/questions/${id}/answers`],
  });

  const form = useForm({
    resolver: zodResolver(insertAnswerSchema),
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await apiRequest("POST", `/api/questions/${id}/answers`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${id}/answers`] });
      form.reset();
      toast({
        title: "Answer posted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to post answer",
        variant: "destructive",
      });
    },
  });

  if (questionLoading || answersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!question) {
    return <div>Question not found</div>;
  }

  return (
    <div className="container py-8 max-w-4xl">
      <QuestionCard question={question} expanded />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          {answers?.length || 0} Answers
        </h2>
        
        <form onSubmit={form.handleSubmit((data) => submitAnswerMutation.mutate(data))} className="mb-8">
          <Textarea
            placeholder="Write your answer..."
            className="min-h-[200px] mb-4"
            {...form.register("content")}
          />
          <Button type="submit" disabled={submitAnswerMutation.isPending}>
            {submitAnswerMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Post Answer"
            )}
          </Button>
        </form>

        <div className="space-y-6">
          {answers?.map((answer) => (
            <AnswerCard key={answer.id} answer={answer} />
          ))}
        </div>
      </div>
    </div>
  );
}
