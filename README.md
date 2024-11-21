# Puny Vote

Puny Vote is a real-time, web-based voting application that allows organizers to create vote sessions and collect votes from participants. The application supports various voting types like Fibonacci, T-Shirt sizing, Thumbs Up/Down, Mood Emojis, and custom options, making it versatile for different use cases such as agile estimations, team polls, and quick decision-making.

## Features

- **Organizer Dashboard**: Create, manage, duplicate, and delete vote sessions.
- **Real-time Voting**: Participants can join sessions using a code and vote in real-time.
- **Multiple Voting Types**: Supports Fibonacci, T-Shirt sizing, Thumbs Up/Down, Mood Emojis, and custom voting options.
- **Participant Management**: See who has joined the session and track voting status.
- **Live Results**: Reveal results instantly with progress bars showing vote counts.
- **Chat Functionality**: Participants can communicate via a chatbox during the lobby.
- **Emoji Selection**: Participants can choose an emoji to represent themselves.
- **Session Sharing**: Share the results with a unique link and token.
- **AI-Generated Summary**: Get an AI-generated summary of the voting session using OpenAI's GPT model.
- **Password Strength Feedback**: Real-time password strength feedback during signup.
- **Guided Tour**: Interactive guided tour using Driver.js on the 'Create Questions' page.
- **Authentication**: Secure sign-up and sign-in for organizers with password validation.
- **Responsive Design**: Mobile-friendly and responsive UI.


## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templating, Bootstrap 4, Socket.IO, Driver.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: express-session, bcryptjs
- **Real-time Communication**: Socket.IO
- **AI Integration**: OpenAI API
- **Other Libraries**: Particles.js, Emoji Picker Element

## Installation

### Prerequisites

- **Node.js** (v12.x or higher)
- **MongoDB** (local or remote)
- **OpenAI API Key** (for AI-generated summaries)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/puny-vote.git
   cd puny-vote
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/punyvote
   SESSION_SECRET=your_session_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

   - Replace `mongodb://localhost:27017/punyvote` with your MongoDB connection string if necessary.
   - Replace `your_session_secret` with a secure random string.
   - Replace `your_openai_api_key` with your OpenAI API Key.

4. **Run the application**

   ```bash
   npm start
   ```

   The server should start on `http://localhost:3000`.

## Usage

### As an Organizer

#### Sign Up

1. Go to `http://localhost:3000/auth/signup`.
2. Fill in your full name, email, and password to create an account.

#### Create a Vote Session

1. After signing in, you'll be redirected to the dashboard.
2. Click on **Create New Vote Collection**.
3. Enter a title for your vote session.

#### Add Questions

1. Choose the voting type: Fibonacci, T-Shirt, Thumbs Up/Down, Mood Emojis, or Custom.
2. Enter the question text and modify options if needed.
3. Click **Add to Collection** to add the question.
4. Repeat to add more questions.
5. When finished, click **Submit All Questions**.

#### Start the Session

1. From the dashboard, click the play icon to start the session.
2. Share the session code with participants.

#### Control the Vote

1. Use the control panel to start taking votes.
2. Advance through questions, reveal results, and view participant statuses.

#### View Results

1. After the session ends, you can view and share the complete results.
2. Use the **AI Summary** feature to get an AI-generated summary of the voting session.
3. Duplicate vote sessions for reuse.

### As a Participant

#### Join a Session

1. Go to `http://localhost:3000/`.
2. Enter the session code provided by the organizer.
3. Choose an alias and an emoji to represent yourself.

#### Wait in the Lobby

- You'll see other participants and can chat while waiting.

#### Vote

1. When the session starts, select your options and submit your votes.
2. If the organizer reveals the results, you'll see live progress bars.

#### View Results

- See the live results if the organizer reveals them.

## Folder Structure

```
puny-vote/
├── app.js
├── package.json
├── models/
│   ├── Participant.js
│   ├── User.js
│   └── VoteSession.js
├── routes/
│   ├── auth.js
│   ├── controlPanel.js
│   ├── index.js
│   ├── lobby.js
│   ├── organizer.js
│   ├── questions.js
│   └── voteParticipation.js
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── types/
│   │   ├── fibonacci.ejs
│   │   ├── tshirt.ejs
│   │   ├── thumbsupdown.ejs
│   │   ├── mood.ejs
│   │   └── custom.ejs
│   ├── aiSummary.ejs
│   ├── answerPanel.ejs
│   ├── answerPanelEnd.ejs
│   ├── controlPanel.ejs
│   ├── createQuestions.ejs
│   ├── createVoteSession.ejs
│   ├── dashboard.ejs
│   ├── error.ejs
│   ├── home.ejs
│   ├── join.ejs
│   ├── lobby.ejs
│   ├── questionPanel.ejs
│   ├── questionPanelEnd.ejs
│   ├── questionPreview.ejs
│   ├── shareResults.ejs
│   ├── signin.ejs
│   └── signup.ejs
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── scripts.js
│   └── images/
│       └── favicon.png
├── middleware/
│   └── auth.js
├── .env.example
└── README.md
```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository.
2. **Create** a new branch:

   ```bash
   git checkout -b feature-name
   ```

3. **Make** your changes and commit them:

   ```bash
   git commit -m 'Add feature'
   ```

4. **Push** to the branch:

   ```bash
   git push origin feature-name
   ```

5. **Submit** a pull request.


## Contact

If you have any questions or suggestions, feel free to open an issue or contact me at [mahmud74@uwindsor.ca](mailto:mahmud74@uwindsor.ca).
