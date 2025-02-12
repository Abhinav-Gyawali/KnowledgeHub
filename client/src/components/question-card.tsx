import { Question, Comment, insertCommentSchema } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";

interface QuestionCardProps {
  question: Question;
  expanded?: boolean;
}

export default function QuestionCard({ question, expanded = false }: QuestionCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(expanded);

  const { data: comments } = useQuery<Comment[]>({
    queryKey: [`/api/questions/${question.id}/comments`],
    enabled: showComments,
  });

  const voteMutation = useMutation({
    mutationFn: async (value: "up" | "down") => {
      const res = await apiRequest("POST", `/api/questions/${question.id}/vote`, { value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${question.id}`] });
      if (!expanded) {
        queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      }
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
      const res = await apiRequest("POST", `/api/questions/${question.id}/comments`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/questions/${question.id}/comments`] });
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
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => voteMutation.mutate("up")}
            disabled={!user}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{question.votes}</span>
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
          {expanded ? (
            <h1 className="text-2xl font-bold">{question.title}</h1>
          ) : (
            <Link href={`/questions/${question.id}`} className="text-xl font-bold hover:underline">
              {question.title}
            </Link>
          )}
          <div className="text-sm text-muted-foreground mt-1">
            Asked by {question.authorId} on{" "}
            {new Date(question.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          {expanded ? question.content : question.content.slice(0, 200) + "..."}
        </div>

        {question.mediaUrls && question.mediaUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {question.mediaUrls.map((url, index) => (
              <div key={index} className="relative">
                {url.includes('video') ? (
                  <video
                    src={url}
                    className="w-full rounded-lg"
                    controls
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Question media ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        )}

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
      </CardContent>
    </Card>
  );
}