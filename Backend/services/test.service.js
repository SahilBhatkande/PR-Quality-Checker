class TestService {
    // Parsing standard jest JSON output
    // In CI we'll run: npx jest --json --outputFile=test-results.json
    parseResults(jestResultsJson) {
        if (!jestResultsJson || !jestResultsJson.numTotalTests) {
            return { total: 0, passed: 0, failed: 0, details: [] };
        }

        const failedDetails = [];
        if (jestResultsJson.numFailedTests > 0) {
            jestResultsJson.testResults.forEach(testSuite => {
                testSuite.assertionResults.forEach(assertion => {
                    if (assertion.status === 'failed') {
                        failedDetails.push({
                            title: assertion.title,
                            messages: assertion.failureMessages
                        });
                    }
                });
            });
        }

        return {
            total: jestResultsJson.numTotalTests,
            passed: jestResultsJson.numPassedTests,
            failed: jestResultsJson.numFailedTests,
            details: failedDetails
        };
    }
}

export default new TestService();
