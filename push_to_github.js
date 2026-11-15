/**
 * Barchs - Push to GitHub Pages Script
 * Usage:
 *   node push_to_github.js <repo-url> <personal-access-token>
 * Example:
 *   node push_to_github.js https://github.com/myusername/barchs-website.git ghp_xxxxxx
 */
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

async function pushToGitHub() {
  const repoUrl = process.argv[2] || process.env.GITHUB_REPO_URL;
  const token = process.argv[3] || process.env.GITHUB_TOKEN;

  if (!repoUrl) {
    console.error('Error: Please provide a GitHub repository URL.');
    console.log('Usage: node push_to_github.js <repo-url> [personal-access-token]');
    process.exit(1);
  }

  console.log(`Setting remote origin: ${repoUrl}`);
  try {
    await git.deleteRemote({ fs, dir: '.', remote: 'origin' });
  } catch (e) {
    // Remote might not exist yet
  }
  await git.addRemote({ fs, dir: '.', remote: 'origin', url: repoUrl });

  console.log('Pushing to GitHub (branch: main)...');
  const pushResult = await git.push({
    fs,
    http,
    dir: '.',
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({ username: token || '' })
  });

  console.log('Push complete!', pushResult);
  console.log('\n=========================================');
  console.log('Website successfully pushed to GitHub!');
  console.log('GitHub Actions will automatically build & deploy to GitHub Pages.');
  console.log('To view deployment: Check the "Actions" tab in your GitHub repository.');
  console.log('=========================================\n');
}

pushToGitHub().catch((err) => {
  console.error('Push failed:', err.message || err);
  process.exit(1);
});
