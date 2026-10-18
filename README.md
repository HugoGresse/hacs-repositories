# HACS Repositories (unofficial)

> **Alpha**, it may lack of lot of features, please check out [the issues](https://github.com/HugoGresse/hacs-repositories/issues) for more infos.

Search within HACS repositories, like you do with NPM. This provide filters and sorts, as well as package description and stastistics (stars, last update, etc).

#### Use it: [hacs-repositories.web.app](https://hacs-repositories.web.app/)

# Dev setup

The site is static: a daily GitHub Actions job (`.github/workflows/update.yml`) runs
`scripts/update-packages.ts`, which fetches the HACS default repositories and their GitHub metadata
into `public/packages.json`, then builds and deploys the site to Firebase Hosting.

1. `npm ci`
2. Generate the data (Node 24, a GitHub token avoids falling back to HACS data-v2 stats):
   `GITHUB_TOKEN=$(gh auth token) npm run update-packages` (takes ~6 min, requests are paced to stay under GitHub rate limits)
3. `npm run dev`
4. Deploy manually: `npm run deploy` (or run the `update` workflow from the Actions tab)

# About

Open source project made by [Hugo Gresse](https://hugo.gresse.io)
My other open source projects:

-   [Open Feedback (speaker/conference/meetup event feedback SASS)](https://openfeedback.io/)
-   [Fill My Slides (Google Slide as template for generating thumbnail using .json data)](https://github.com/HugoGresse/Fill-My-Slides)
