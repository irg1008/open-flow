import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, useQuery, withConvex } from "@/lib/convex";

export const CommentList = withConvex(() => {
  const comments = useQuery(api.comments.queries.list);

  return comments === undefined ? (
    <p className="py-4 text-center text-gray-500">Loading comments...</p>
  ) : comments.length === 0 ? (
    <p className="py-4 text-center text-gray-500">No comments found.</p>
  ) : (
    <div className="space-y-6">
      {comments.map((comment) => (
        <Card key={comment._id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">{comment.author}</CardTitle>
              <span className="text-muted-foreground text-sm">
                {new Date(comment._creationTime).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="whitespace-pre-line">{comment.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
