# HACS Repositories (unofficial)

> **Alpha**, it may lack of lot of features, please check out [the issues](https://github.com/HugoGresse/hacs-repositories/issues) for more infos.

Search within HACS repositories, like you do with NPM. This provide filters and sorts, as well as package description and stastistics (stars, last update, etc).

#### Use it: [hacs-repositories.web.app](https://hacs-repositories.web.app/)

# Dev setup (to be completed)

1. Clone, install dependencies, also within `functions/`
2. Add a function env with `github.token` and your GitHub API token: `firebase functions:config:set github.token=`
3. Deploy the functions (`firebase deploy --only functions`) OR update `src/firebase/firebase.ts` to use local function and run them locally.
4. For the front: `npm start` will run the website and open `localhost:3000`
5. Within the website, the first tie your database will be empty, create it on [console.firebase.google.com](https://console.firebase.google.com) and next, update it from the website (click on Last update then Request update)
6. Your good to go!
7. Deploy: `npm run deploy` will build functions and web app, and deploy to Firebase

# About

Open source project made by [Hugo Gresse](https://hugo.gresse.io)
My other open source projects:

-   [Open Feedback (speaker/conference/meetup event feedback SASS)](https://openfeedback.io/)
-   [Fill My Slides (Google Slide as template for generating thumbnail using .json data)](https://github.com/HugoGresse/Fill-My-Slides)
