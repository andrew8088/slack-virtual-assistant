const R = require("ramda");
const { Octokit } = require("@octokit/rest");
const { DateTime, Interval } = require("luxon");

//-- Module Constants
const octokit = Octokit({
  auth: process.env.GITHUB_API_TOKEN,
  userAgent: process.env.GITHUB_USER_AGENT
});

//-- Module Functions
async function getPullRequests(owner, repo, limit = 20) {
  const lastPrCreated = await getLastCreatedPullRequest(owner, repo);
  const prData = [];

  let nextPr = lastPrCreated - limit + 1;
  while (nextPr <= lastPrCreated) {
    console.log("fetching", owner, repo, nextPr);
    const pr = getPullRequest(owner, repo, nextPr);
    prData.push(pr);
    nextPr++;
  }

  return await Promise.all(prData);
}

function transformPullRequests(prs = []) {
  prs = prs.map(pr => transformPullRequest(pr));

  const reviewData = getPullRequestReviewers(prs);

  const openPullRequests = prs.filter(pr => pr.state === "open");

  return { reviewData, openPullRequests };
}

module.exports = {
  getPullRequests,
  transformPullRequests
};

//-- Helper Functions

async function getPullRequest(owner, repo, pull_number) {
  const { data: pullRequest } = await octokit.pulls.get({
    owner,
    repo,
    pull_number
  });

  const { data: reviews } = await octokit.pulls.listReviews({
    owner,
    repo,
    pull_number
  });

  return {
    pullRequest,
    reviews
  };
}

async function getLastCreatedPullRequest(owner, repo) {
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    sort: "created",
    direction: "desc",
    per_page: 1,
    page: 1
  });
  return data[0].number;
}

function getPullRequestReviewers(prs) {
  const users = {};

  for (let pr of prs) {
    pr.reviews.forEach(r => {
      // Make sure user is in the map.
      if (!users[r.reviewer]) {
        users[r.reviewer] = {
          lastReview: new Date(0),
          duration: null
        };
      }

      // populate map with the revierw data
      let date = new Date(r.submitted_at);
      if (users[r.reviewer].lastReview < date) {
        users[r.reviewer] = {
          pr: R.pick(["repo", "number", "creator", "title"], pr),
          lastReview: date,
          duration: DateTime.fromJSDate(date).toRelative(),
          delta: Interval.fromDateTimes(date, new Date())
            .toDuration(["hours"])
            .toObject()
        };
      }
    });
  }
  return users;
}

// ----------------------------------------------------------------------------
// EXTRACT
// ----------------------------------------------------------------------------

function transformPullRequest({ pullRequest, reviews }) {
  const created_at = DateTime.fromJSDate(new Date(pullRequest.created_at));
  return {
    url: pullRequest.url,
    repo: pullRequest.base.repo.name,
    number: pullRequest.number,
    creator: pullRequest.user.login,
    state: pullRequest.state,
    title: pullRequest.title,
    created_at: created_at.toLocaleString({
      weekday: "short",
      month: "short",
      day: "2-digit"
    }),
    openTime: created_at.toRelative(),
    closed_at: pullRequest.closed_at,
    milestone: R.path(["milestone", "title"], pullRequest),

    reviews: reviews
      .map(r => ({
        reviewer: r.user.login,
        state: r.state,
        submitted_at: r.submitted_at
      }))
      .filter(r => r.reviewer !== pullRequest.user.login) // doens't count if you comment on your own PR
  };
}
