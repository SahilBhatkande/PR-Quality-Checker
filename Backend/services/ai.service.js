class AIService {
    async analyzeFailures(lintResults, testResults) {
        if (!process.env.OPENAI_API_KEY) {
            return 'No OpenAI API key provided. AI suggestions are disabled.';
        }

        try {
            // In a real application we would use the openai npm package
            // For this example, we mock the call or do a simple fetch

            const prompt = `Analyze the following test and lint failures and provide brief, constructive suggestions:
      Lint Errors: ${JSON.stringify(lintResults.details || [])}
      Test Failures: ${JSON.stringify(testResults.details || [])}
      `;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 300
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return data.choices[0].message.content;
            }
            return 'Could not generate AI suggestions.';
        } catch (error) {
            console.error('AI Service Error:', error);
            return 'Error connecting to AI service.';
        }
    }
}

export default new AIService();
