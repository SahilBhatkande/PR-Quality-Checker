import { ESLint } from 'eslint';

class LintService {
    constructor() {
        this.eslint = new ESLint();
    }

    // Programmatically run ESLint on files
    async lintFiles(filePaths) {
        try {
            // Note: in a CI/CD workflow context run directly in the target repo we can just use `npm run lint -- --output-file results.json --format json`
            // But programmatically:
            const results = await this.eslint.lintFiles(filePaths);

            let errorCount = 0;
            let warningCount = 0;
            let messages = [];

            results.forEach((result) => {
                errorCount += result.errorCount;
                warningCount += result.warningCount;
                if (result.messages.length > 0) {
                    messages.push({
                        filePath: result.filePath,
                        messages: result.messages,
                    });
                }
            });

            return {
                errors: errorCount,
                warnings: warningCount,
                details: messages
            };
        } catch (error) {
            console.error('Linting error:', error);
            throw error;
        }
    }
}

export default new LintService();
