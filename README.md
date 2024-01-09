# Discord Manager

![Project logo](./images/discord_logo.jpeg)

# Introduction

Welcome to the development project of the Discord Management Bot!
This project aims to create a powerful tool to assist in Discord server administration, providing useful and customizable functionalities.

# Objective

The main goal of the Bot is to simplify administrative tasks, improve interaction among server members, and offer a more personalized experience. Some features include moderation, event tracking, and more.

Of course, this project currently has only a limited set of features, but it serves as a great starting point for future implementations.

# Technologies Used
The project is developed in Node.js, leveraging the Discord.js library to interact with the Discord API.
Additionally, modern asynchronous programming techniques will be implemented to ensure efficient and responsive execution.

- Node.js (v18)
- Express.js
- Typescript
- Jest
- MongoDB / Mongoose

# Getting Started

`git clone https://github.com/ErikPatrik/discord-manager.git`

# Install Dependencies:

```bash
cd discord-management-bot
npm install
npm run build
npm run dev // npm run start
```

# Observation

It is important to emphasize the creation of a .env file at the root of your project, where it should contain the following variables:

```bash
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
MONGO_USER=
MONGO_PASS=
MONGO_URI=
PORT_SERVER=
```

<h3>The bot comes equipped with several functionalities to enhance server management and user interactions. Here are some of the key features:</h3>

# Banishment:

- Command: `/ban`
- Description: Bans a user from the server, allowing the addition of a comment for reference.

# Punishment:

- Command: `/punishment`
- Description: Applies a temporary punishment to a server user for a specified duration. Users can also include a comment related to the punishment.

# User Role Change:

- Command: `/temprole`
- Description: Temporarily changes the role of a server user. Users can provide a comment regarding the user's role change.

# Logging System:

- Details: Upon adding the bot to a server, it automatically creates a private channel named "moderation." This channel serves as a centralized location to log and record all actions taken within the server, ensuring the moderation team stays informed.

These functionalities aim to streamline administrative tasks, improve member-server interactions, and provide a more personalized experience for server members. The project is designed to serve as a foundation, and additional features can be implemented in the future for further enhancement.