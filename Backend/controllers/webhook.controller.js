import githubService from '../services/github.service.js';
import lintService from '../services/lint.service.js';
import testService from '../services/test.service.js';
import aiService from '../services/ai.service.js';
import PrRecord from '../models/prRecord.model.js';
import crypto from 'crypto';

// Optional: verify github signature if deployed as a real app
const verifySignature = (req) => {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) return false;
    // Simplification for the example: assume valid if no secret set, or verify otherwise
    if (!process.env.GITHUB_WEBHOOK_SECRET) return true;

    const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

export const handleWebhook = async (req, res) => {
    try {
        const event = req.headers['x-github-event'];

        // In our CI/CD scenario, we might receive results directly from Github Actions instead
        // We can differentiate based on format or custom headers
        if (req.body.action === 'ci_completed') {
            return handleCIResults(req, res);
        }

        if (event === 'pull_request') {
            const { action, pull_request, repository } = req.body;

            // We process only opened or synchronize (new commits)
            if (['opened', 'synchronize'].includes(action)) {
                console.log(`Processing PR #${pull_request.number} in ${repository.full_name}`);

                // Let's set commit status to pending
                await githubService.setCommitStatus({
                    owner: repository.owner.login,
                    repo: repository.name,
                    sha: pull_request.head.sha,
                    state: 'pending',
                    description: 'PR Quality Check is running',
                });

                // 1. Fetch changed files
                const changedFiles = await githubService.getChangedFiles(
                    repository.owner.login,
                    repository.name,
                    pull_request.number
                );

                // We assume the repos are either cloned locally or we run via CI/CD
                // To keep it simple and production-ready, this web service often listens to GitHub Actions 
                // passing the test/lint output back to it. Let's respond ok for now, and rely on Actions.
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
};

const handleCIResults = async (req, res) => {
    const { prDetails, lintResults, testResults } = req.body;

    try {
        const { owner, repo, prNumber, sha, author, title } = prDetails;

        // Validate rules
        const passedTests = testResults.failed === 0;
        const passedLinting = lintResults.errors === 0;

        const overallStatus = (passedTests && passedLinting) ? 'success' : 'failure';

        // Set GitHub check status
        await githubService.setCommitStatus({
            owner,
            repo,
            sha,
            state: overallStatus,
            description: `Tests: ${testResults.failed} failed. Lint: ${lintResults.errors} errors.`,
        });

        // Optional AI insights
        let aiFeedback = '';
        if (!passedLinting || !passedTests) {
            aiFeedback = await aiService.analyzeFailures(lintResults, testResults);
        }

        // Post comment
        const commentId = await githubService.postPRComment({
            owner,
            repo,
            prNumber,
            lintResults,
            testResults,
            aiFeedback
        });

        // Save to DB
        await PrRecord.findOneAndUpdate(
            { repoFullname: `${owner}/${repo}`, prNumber },
            {
                repoFullname: `${owner}/${repo}`,
                prNumber,
                prTitle: title,
                author,
                status: overallStatus === 'success' ? 'passed' : 'failed',
                lintErrors: lintResults.errors,
                lintWarnings: lintResults.warnings,
                testFailures: testResults.failed,
                passedAllTests: passedTests,
                aiSuggestions: aiFeedback,
                githubCommentId: commentId
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: 'Processed CI results' });
    } catch (error) {
        console.error('Error processing CI results:', error);
        res.status(500).json({ error: error.message });
    }
};
