## Idea11y: Enhancing Accessibility in Collaborative Ideation for Blind or Low Vision Screen Reader Users
Authors: Mingyi Li, Huiru Yang, Nihar Sanda, Maitraye Das

### Overview
Idea11y is a Miro plugin with:

- **Frontend**: a React + TypeScript Miro app
- **Server**: a Python / Flask backend in the `server/` directory that provides grouping and note-placement APIs.

To access the plugin within Miro, you need to first have a [Developer team](https://developers.miro.com/docs/create-a-developer-team).

### Creating a new app in the Miro Developer Team
- Once you have created a Developer team, go to the [Profile settings page](https://miro.com/app/settings/company/3458764544667285497/user-profile/apps?devTeamDialog=1) and under Your apps, click "Create new app" button. Please remember the app name that you use.
- Alternatively, when you are in the [team dashboard](https://miro.com/app/dashboard/) where it shows "Boards in this team." On the top right corner, click "Build apps" button. On the list that shows "Learning resources," go down and find "Your apps." Here, it will display all the apps within a team, click "Create a new app" button on the right side.

### Adding Idea11y link to your app
- On the Profile settings page, go to App URL section, and paste this link: https://idea11y.vercel.app/. Click "Save" button to record changes.
- Go to "Install app and get OAuth token" button on the same profile settings page. Select your developer team name and continue.
- Click "Go to boards" button at the top or go to the [team dashboard](https://miro.com/app/dashboard/). Now, it will show "Boards in this team". On the right, click "Create new" button to create a whiteboard.

### Opening the Idea11y app in your whiteboard
- Once you are in a Miro board, for the first-time user, click the add icon on the left tool bar, and search your app name. Now you can use Idea11y to brainstorm with your collaborators!
- Instructions for screen reader users:
1. You will hear "Miro board" after opening a board. Tab until you hear “Create with AI” or "Creation tool bar."
2. Press Down arrow until "Tools, Media, and Integrations", press Enter.
3. In "Search tools…", type the app name that you just created and tab until you hear the app in the list. Press Enter.
4. When you hear the app name, tab until you hear "Ideally." Now you can use it for brainstorming! Note that if you have opened it once in a board, the app will be automatically saved in your tool bar, above the "Tools, Media, and Integrations" button.

### Knowing whiteboard
- We would like to illustrate four core objects that you may interact with: board, frame, cluster, and sticky notes. 
- If you are familiar with writing tools (e.g., Microsoft Words, google docs, etc.), you can think of a Board as the main document. Frames are like headers and Clusters are like sub-headers. Sticky notes are like bullet points or text under a header or sub-header. Particularly, you may feel confused about the name of “Frame”, think of it as a bounding region on the whiteboard. 
- One common use of digital whiteboard is group brainstorming through adding and clustering sticky notes on the board. 
  
### Using Idea11y
- Idea11y currently only supports sticky note-based board activities. Clusters (sticky notes that are placed closely to each other) are organized from left to right, and notes within a cluster are organized from top to bottom. For example, the leftmost cluster on the Miro board will be Cluster 1 on Idea11y. The only exception is when there's only one cluster on the board, notes will then be automatically grouped by colors on Idea11y. 
- For the following keyboard shortcuts, "cmd" is the command for Mac users, while "(ctrl+alt)" is the command for Windows users. For the best user experience, please use a Chrome or Safari browser.
- Get a note's creator and color: when you’re on a note, press "cmd/(alt+control) + i." "i" here stands for "information." 
- Note editing (edit text/color, move): Press "cmd/(ctrl+alt) + e." Here, "e" stands for "editing". To edit the note's color, type a slash and then color name, such as "/red". 
- Jump to collaborator: Press "cmd/(ctrl+alt) + x" where x is the order number shown next to the Current Users under Board Overview (e.g., the first user is 1, the second is 2).

### About the repository
Since the app has been deployed on Vercel, you do 
not need any local setups in order to run the Idea11y app. 
To learn more about the implementation details:
- **Frontend (Miro plugin)**: This root folder contains the plugin UI built with React and TypeScript. You can run it locally with:
  - `npm install`
  - `npm start`
- **Server (backend APIs)**: The `server/` folder contains the Idea11y Flask server.
  - See `server/README.md` for how to create a virtualenv, install Python dependencies, and run `python app.py`.
  - By default the server runs on port `5000` and exposes endpoints like `/api/grouping` and `/api/editing_group`.
  - In production, the deployed frontend talks to a hosted instance of this server. For local development, you can switch the API base URL in `src/api/grouping.tsx` to point to your local server (e.g., `http://127.0.0.1:5000/api`).
- Environment variables
  - **Frontend Firebase config** (`.env` in the repo root). Create a `.env` file (not committed to git) with your Firebase config values:
  These are read in `src/config/firebase.ts` via `import.meta.env`.

  - **Backend OpenAI API key** (`server/.env`). 
  Inside the `server/` folder, create a `.env` file with your OpenAI API key.
  The Flask server loads this with `python-dotenv` and uses it in `server/grouping/utils/ai.py` to call the OpenAI API.
 


