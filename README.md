# UPS Burn-In Web App

A customizable web application to generate UPS burn-in test schedules.

## Files
- `package.json`: Node.js dependencies and scripts.
- `src/server.js`: Backend server logic using Express.
- `public/index.html`: Frontend with form and schedule display.
- `public/styles.css`: Styling for the frontend.

## Setup (Local Testing)
1. Clone the repository: `git clone https://github.com/your-username/ups-burn-in-web.git`
2. Install Node.js from [nodejs.org](https://nodejs.org).
3. Run `npm install` to install dependencies.
4. Start the server with `npm start`.
5. Access at `http://localhost:3000`.

## Features
- Customizable UPS line-ups, STSs, busways, durations, capacities, and load levels.
- Dynamic schedule generation with busway rotation.

## Deployment
Deploy to a Node.js-compatible host like Heroku:
- Create a `Procfile` with `web: node src/server.js`.
- Push to Heroku with `git push heroku main`.
