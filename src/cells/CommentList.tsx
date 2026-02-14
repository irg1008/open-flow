import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { api, useQuery, withConvex } from "@/lib/convex";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export const CommentList = withConvex(() => {
  const comments = useQuery(api.comments.list);

  const signIn = async () => {
    await authClient.signIn.social({ provider: "github" });
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  return comments === undefined ? (
    <p className="py-4 text-center text-gray-500">Loading comments...</p>
  ) : comments.length === 0 ? (
    <p className="py-4 text-center text-gray-500">No comments found.</p>
  ) : (
    <div className="space-y-6">
      <Unauthenticated>
        Logged out
        <Button onClick={signIn}>Sign in</Button>
      </Unauthenticated>
      <Authenticated>
        Logged in
        <Button onClick={signOut}>Sign out</Button>
      </Authenticated>
      <AuthLoading>Loading...</AuthLoading>

      {comments.map((comment) => (
        <article
          key={comment._id}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
        >
          <header className="mb-2 flex items-center justify-between">
            <strong className="font-medium text-gray-900">{comment.author}</strong>
            <span className="text-sm text-gray-500">
              {new Date(comment._creationTime).toLocaleDateString()}
            </span>
          </header>
          <main className="leading-relaxed text-gray-700">
            <p className="whitespace-pre-line">{comment.content}</p>
          </main>
        </article>
      ))}
    </div>
  );
});
