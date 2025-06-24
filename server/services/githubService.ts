import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function commitToGitHub(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch = "main"
) {
  // 1) Get the current sha
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const shaLatest = refData.object.sha;

  // 2) Create a blob
  const { data: blobData } = await octokit.git.createBlob({
    owner,
    repo,
    content: Buffer.from(content).toString("base64"),
    encoding: "base64",
  });

  // 3) Create a tree entry
  const { data: treeData } = await octokit.git.createTree({
    owner,
    repo,
    tree: [
      {
        path,
        mode: "100644",
        type: "blob",
        sha: blobData.sha,
      },
    ],
    base_tree: shaLatest,
  });

  // 4) Create a commit
  const { data: commitData } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: treeData.sha,
    parents: [shaLatest],
  });

  // 5) Move the branch
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commitData.sha,
  });
}
