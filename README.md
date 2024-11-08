# Puny Vote

Puny Vote is a real-time, web-based voting application that allows organizers to create vote sessions and collect votes from participants. The application supports various voting types like Fibonacci, T-Shirt sizing, and custom options, making it versatile for different use cases such as agile estimations, team polls, and quick decision-making. (Note: This is still under development)

## Features

- **Organizer Dashboard**: Create, manage, and delete vote sessions.
- **Real-time Voting**: Participants can join sessions using a code and vote in real-time.
- **Multiple Voting Types**: Supports Fibonacci, T-Shirt sizing, and custom voting options.
- **Participant Management**: See who has joined the session and track voting status.
- **Live Results**: Reveal results instantly with progress bars showing vote counts.
- **Chat Functionality**: Participants can communicate via a chatbox during the session.
- **Session Sharing**: Share the results with a unique link.
- **Authentication**: Secure sign-up and sign-in for organizers.
- **Responsive Design**: Mobile-friendly and responsive UI.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templating, Bootstrap 4, Socket.IO
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: Express-session, bcryptjs
- **Real-time Communication**: Socket.IO

## Installation

### Prerequisites

- Node.js (v12.x or higher)
- MongoDB (local or remote)

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
   ```

   Replace `mongodb://localhost:27017/punyvote` with your MongoDB connection string if necessary.

4. **Run the application**

   ```bash
   npm start
   ```

   The server should start on `http://localhost:3000`.

## Usage

### As an Organizer

1. **Sign Up**

   - Go to `http://localhost:3000/auth/signup`.
   - Fill in your full name, email, and password to create an account.

2. **Create a Vote Session**

   - After signing in, you'll be redirected to the dashboard.
   - Click on "Create New Vote Collection".
   - Enter a title for your vote session.

3. **Add Questions**

   - Choose the voting type: Fibonacci, T-Shirt, or Custom.
   - Enter the question text and modify options if needed.
   - Click "Add to Collection" to add the question.
   - Repeat to add more questions.
   - When finished, click "Submit All Questions".

4. **Start the Session**

   - From the dashboard, click the play icon to start the session.
   - Share the session code with participants.

5. **Control the Vote**

   - Use the control panel to start taking votes.
   - Advance through questions, reveal results, and view participant statuses.

6. **View Results**

   - After the session ends, you can view and share the complete results.

### As a Participant

1. **Join a Session**

   - Go to `http://localhost:3000/`.
   - Enter the session code provided by the organizer.
   - Choose an alias and emoji.

2. **Wait in the Lobby**

   - You'll see other participants and can chat while waiting.

3. **Vote**

   - When the session starts, select your options and submit your votes.

4. **View Results**

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
│   │   └── custom.ejs
│   ├── answerPanel.ejs
│   ├── answerPanelEnd.ejs
│   ├── controlPanel.ejs
│   ├── createQuestions.ejs
│   ├── createVoteSession.ejs
│   ├── dashboard.ejs
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
└── .env
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes and commit them: `git commit -m 'Add feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.


## Contact

If you have any questions or suggestions, feel free to open an issue or contact me at [mahmud74@uwindsor.ca](mailto:mahmud74@uwindsor.ca).
