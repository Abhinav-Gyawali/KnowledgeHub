import { Answer, Comment, insertCommentSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";

interface AnswerCardProps {
  answer: Answer;
}

export default function AnswerCard({ answer }: AnswerCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  const { data: comments } = useQuery<Comment[]>({
    queryKey: [`/api/answers/${answer.id}/comments`],
    enabled: showComments,
  });

  const voteMutation = useMutation({
    mutationFn: async (value: "up" | "down") => {
      const res = await apiRequest("POST", `/api/answers/${answer.id}/vote`, { value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${answer.questionId}/answers`] });
    },
    onError: () => {
      toast({
        title: "Failed to vote",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertCommentSchema),
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await apiRequest("POST", `/api/answers/${answer.id}/comments`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/answers/${answer.id}/comments`] });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => voteMutation.mutate("up")}
              disabled={!user}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{answer.votes}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => voteMutation.mutate("down")}
              disabled={!user}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-2">
              Answered by {answer.authorId} on{" "}
              {new Date(answer.createdAt).toLocaleDateString()}
            </div>
            <div className="prose max-w-none">{answer.content}</div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {comments?.length || 0} Comments
              </Button>
            </div>

            {showComments && (
              <div className="mt-4 space-y-4">
                {comments?.map((comment) => (
                  <div key={comment.id} className="text-sm border-l-2 pl-4">
                    <div className="text-muted-foreground">
                      {comment.authorId} commented on{" "}
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-1">{comment.content}</div>
                  </div>
                ))}

                {user && (
                  <form
                    onSubmit={form.handleSubmit((data) => commentMutation.mutate(data))}
                    className="mt-4"
                  >
                    <Textarea
                      placeholder="Write a comment..."
                      className="mb-2"
                      {...form.register("content")}
                    />
                    <Button type="submit" size="sm">
                      Add Comment
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
