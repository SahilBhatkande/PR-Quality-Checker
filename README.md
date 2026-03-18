# PR Quality Checker Bot 🤖

A production-ready PR Quality Checker Bot built with Node.js, Express, and MongoDB. This bot integrates seamlessly with GitHub Actions and Webhooks to automatically lint, test, and perform AI-driven code reviews on your Pull Requests.

## Features ✨
- **Automated PR Reviews**: Automatically runs ESLint and Jest on PRs.
- **GitHub Integration**: Posts detailed, structured comments with check results directly to the PR.
- **Merge Blocking**: Sets GitHub Commit Status checks to block merging if tests or linting fails.
- **AI Suggestions**: Connects to OpenAI to analyze failing tests and lint errors, providing constructive feedback.
- **Database History**: Stores PR check histories in MongoDB, allowing for easy dashboarding and stat tracking.

## Architecture & Folder Structure 🏗️
The backend uses a clean, scalable, interview-ready folder structure:

```
Backend/
├── config/           # Database and general configuration
│   └── db.js         # MongoDB connection setup
├── controllers/      # Route controllers (Webhook handler)
│   └── webhook.controller.js
├── models/           # Mongoose Database Models
│   └── prRecord.model.js
├── routes/           # Express Route Definitions
│   └── webhook.routes.js
├── services/         # Core business logic
│   ├── ai.service.js      # OpenAI API integration
│   ├── github.service.js  # Octokit GitHub API integration
│   ├── lint.service.js    # Programmatic ESLint execution
│   └── test.service.js    # Jest results processing
├── .env.example      # Environment variables template
├── .eslintrc.json    # ESLint configuration
├── package.json      # Dependencies and scripts -> 'type: module' used.
└── server.js         # Express App Entry Point
```

### Why this architecture?
- **Separation of Concerns**: Controllers only handle HTTP requests/responses. Business logic lives in `services/`.
- **Modularity**: Easy to swap out Jest for Mocha or ESLint for Biome by just updating the respective service.
- **Scalability**: The setup is designed to easily add more webhooks (e.g., issues, pushes) or new routes without cluttering `server.js`.

## Setup & Deployment Instructions 🚀

### 1. Local Setup
1. Clone the repository and navigate to `/Backend`.
2. Run `npm install` to install all dependencies.
3. Copy `.env.example` to `.env` and fill in your values:
   - `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/pr-quality-checker`).
   - `GITHUB_TOKEN`: A Personal Access Token with `repo` permissions.
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API Key for suggestions.
4. Run `npm run dev` to start the server via Nodemon.

### 2. GitHub Action Setup
1. Add `.github/workflows/pr-check.yml` to the repository you want to monitor.
2. In your GitHub repository settings, go to **Secrets and variables > Actions**.
3. Create a new secret called `BOT_WEBHOOK_URL` containing the live URL of your backend (e.g., `https://my-quality-bot.onrender.com`).
4. Whenever a PR is opened or synchronized, the Action will run tests, lint the code, and POST the results securely to your backend.

### 3. Production Deployment
- **Hosting**: Deploy the Next.js/Express app via Render, Heroku, or an AWS EC2 instance.
- **Database**: Use MongoDB Atlas for a production-ready cloud database.
- Ensure your `BOT_WEBHOOK_URL` points to your public, SSL-secured domain.

## Sample Bot Comment 💬
When a PR check finishes, the bot posts a structured comment via the GitHub API:

> ## PR Quality Check Results ❌
> 
> ### 🧪 Testing (Jest)
> - **Passed:** 4
> - **Failed:** 1
> - **Total:** 5
> 
> ### 🔍 Linting (ESLint)
> - **Errors:** 2
> - **Warnings:** 0
> 
> ### 🤖 AI Suggestions
> - Consider checking `utils.js` on line 42; the `console.log` violates the `no-console` rule.
> - The `UserService` test failed because mock data was undefined. Please verify the API mock setup.

---
*Created as an interview-ready, scalable architecture demonstration.*
