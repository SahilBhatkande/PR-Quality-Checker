import { Octokit } from '@octokit/rest';

class GithubService {
    constructor() {
        this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    }

    async setCommitStatus({ owner, repo, sha, state, description }) {
        if (!process.env.GITHUB_TOKEN) return console.log('No GitHub token, skipping status update.');
        try {
            await this.octokit.repos.createCommitStatus({
                owner,
                repo,
                sha,
                state, // error, failure, pending, or success
                description,
                context: 'PR Quality Checker Bot',
            });
        } catch (error) {
            console.error('Failed to set commit status:', error);
        }
    }

    async getChangedFiles(owner, repo, prNumber) {
        if (!process.env.GITHUB_TOKEN) return [];
        try {
            const { data } = await this.octokit.pulls.listFiles({
                owner,
                repo,
                pull_number: prNumber,
            });
            return data.map(file => file.filename);
        } catch (error) {
            console.error('Failed to get changed files:', error);
            return [];
        }
    }

    async postPRComment({ owner, repo, prNumber, lintResults, testResults, aiFeedback }) {
        if (!process.env.GITHUB_TOKEN) return null;
        try {
            const passedTests = testResults.failed === 0;
            const passedLinting = lintResults.errors === 0;

            const emoji = (passedTests && passedLinting) ? '✅' : '❌';

            let commentBody = `## PR Quality Check Results ${emoji}\n\n`;

            commentBody += `### 🧪 Testing (Jest)\n`;
            commentBody += `- **Passed:** ${testResults.passed}\n`;
            commentBody += `- **Failed:** ${testResults.failed}\n`;
            commentBody += `- **Total:** ${testResults.total}\n\n`;

            commentBody += `### 🔍 Linting (ESLint)\n`;
            commentBody += `- **Errors:** ${lintResults.errors}\n`;
            commentBody += `- **Warnings:** ${lintResults.warnings}\n\n`;

            if (aiFeedback) {
                commentBody += `### 🤖 AI Suggestions\n\n`;
                commentBody += `${aiFeedback}\n\n`;
            }

            const { data } = await this.octokit.issues.createComment({
                owner,
                repo,
                issue_number: prNumber,
                body: commentBody,
            });

            return data.id;
        } catch (error) {
            console.error('Failed to post PR comment:', error);
            return null;
        }
    }
}

export default new GithubService();
