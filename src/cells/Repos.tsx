import { withConvex } from "@/lib/convex";

export const Repos = withConvex(() => {
  // const listRepos = useAction(api.github.listRepos);

  return (
    <div>
      {/* {repos?.map((repo) => (
        <div key={repo.id}>{repo.name}</div>
      ))} */}

      {/* <Button
        onClick={async () => {
          const result = await listRepos();
          console.log(result);
        }}
      >
        List repos
      </Button> */}
    </div>
  );
});
