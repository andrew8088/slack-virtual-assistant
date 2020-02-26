const R = require("ramda");
const _ = require("underscore");
const {
  getPullRequests,
  transformPullRequests
} = require("../services/github-service");

//-- Module Functions

async function createNudges(
  repoFetchParams,
  githubToSlackIdMap,
  hoursSinceLastReview
) {
  const { reviewData, openPullRequests } = await getGithubData(repoFetchParams);
  const users = transformUsersWithSlackIdAndReviewDelta(
    reviewData,
    githubToSlackIdMap
  );

  users.forEach(user => {
    log(
      user.githubUsername,
      Math.floor(user.delta.hours),
      hoursSinceLastReview
    );
  });

  console.log(openPullRequests);

  return users
    .filter(user => user.delta.hours >= hoursSinceLastReview)
    .map(user => ({
      to: user.slackId,
      message: createPrNudgeMessage({ user, openPullRequests })
    }));
}

module.exports = {
  createNudges
};

//-- Helper Functions

async function getGithubData(repoFetchParams = []) {
  // Fetch PRs
  let pullRequests = R.flatten(
    await Promise.all(
      repoFetchParams.map(([owner, repo, limit]) =>
        getPullRequests(owner, repo, limit)
      )
    )
  );

  // transform PRs
  return transformPullRequests(pullRequests);
}

function transformUsersWithSlackIdAndReviewDelta(
  reviewData,
  githubToSlackIdMap
) {
  return Object.keys(githubToSlackIdMap).map(key => ({
    githubUsername: key,
    slackId: githubToSlackIdMap[key],
    ...(reviewData[key] || { delta: { hours: Infinity } })
  }));
}

function log(...msgs) {
  console.log(...msgs, "\t\t");
}

function createPrNudgeMessage({ user, openPullRequests }) {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Hey <@${user.slackId}> (${user.githubUsername}), your last PR review was ${user.duration}. Why not take a look at one of these?`
      }
    },
    ...R.flatten(
      _.shuffle(openPullRequests)
        .slice(0, 3)
        .map(pr => [
          { type: "divider" },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `<${pr.url}|${pr.title}>`
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Creator:*\n${pr.creator}`
              },
              {
                type: "mrkdwn",
                text: `*When:*\n${pr.created_at} (${pr.openTime})`
              },
              {
                type: "mrkdwn",
                text: `*Repository:*\n${pr.repo}`
              },
              {
                type: "mrkdwn",
                text: `*Milestone:*\n${pr.milestone}`
              }
            ]
          }
        ])
    )
  ];
}
