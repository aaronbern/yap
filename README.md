README for Yap Chat Application
Project Overview
The Yap Chat Application is a real-time messaging platform developed using the MERN stack (MongoDB, Express.js, React, Node.js). This application supports basic chat functionality, file attachments, polls within chat rooms, and various other interactive features. The project aimed to create a seamless communication experience for users with additional features to enhance usability and engagement.


## Installation and Usage

### Prerequisites
Ensure you have **Node.js** and **npm (Node Package Manager)** installed on your machine.

### Installation

1. **Clone the repository:**
   - `git clone https://github.com/daniiltsioma/yap.git`
2. **Navigate to the project folder:**
   - `cd yap-chat-application`
3. **Install dependencies:**
   - In the root directory: `npm install`
   - Navigate to the `front-end` directory: `cd front-end` and run `npm install`
   - Navigate to the `Back-End` directory: `cd ../Back-End` and run `npm install`

### Running the Application

4. **Start the back-end server:**
   - In the `Back-End` directory, run: `npm start`
5. **Start the front-end server:**
   - Open a new terminal window or tab
   - Navigate to the `front-end` directory: `cd path/to/yap-chat-application/front-end` and run: `npm start`

### Accessing the Application

6. After starting the front-end server, your default browser should automatically open and navigate to the application.
7. If it doesn't open automatically, navigate to `http://localhost:3000` in your browser.

### Enjoy Using Yap Chat!

You should now be able to use the Yap Chat Application. Enjoy chatting, creating polls, and sharing files in real-time!

Project Structure
Back-End
The back-end of the application is organized into several key directories and files:

Configurations
config/: Contains configuration files for various services.
multer.js: Configures multer for handling file uploads.
passport.js: Configures passport for user authentication.
Controllers
controllers/: Manages the logic for handling incoming requests and sending responses.
auth_controller.js: Handles user authentication logic.
chat_controller.js: Manages chat-related operations.
user_controller.js: Manages user-related operations.
Middleware
middleware/: Contains middleware functions to be used in the application.
auth.js: Middleware for handling authentication.
ioMiddleware.js: Middleware for handling Socket.IO connections.
Models
models/: Defines the data models for MongoDB.
chat_room.js: Schema for chat rooms.
message.js: Schema for messages.
polls.js: Schema for polls.
user.js: Schema for users.
Routes
routes/: Defines the routes/endpoints for the application.
auth.js: Routes for authentication.
chat_routes.js: Routes for chat-related operations.
poll_routes.js: Routes for poll-related operations.
user_routes.js: Routes for user-related operations.
Static Files
uploads/: Directory for storing uploaded files.
Server Entry Point
server.js: The main entry point of the server application.
Front-End
The front-end is a React application structured as follows:

Dependencies
node_modules/: Contains all npm dependencies.
Static Files
public/: Contains static files such as the main HTML file and images.
Source Code
src/: Contains the source code for the React application.
App.js: Main application component.
App.css: Main CSS file for styling.
Various other components and their respective CSS files (e.g., ContextMenu.js, PollModal.js).
Configuration Files
.env: Environment configuration file.
.gitignore: Specifies files to be ignored by git.
package.json: Lists project dependencies and scripts.
Implementation Details
The project implements real-time communication using Socket.IO for messaging, file uploads using multer, and poll management within chat rooms. User authentication is handled via Google OAuth configured with Passport.js. The application also features context menus for chat rooms and polls, enhancing usability and interactivity.

Test Implementation
The testing setup uses mocha, chai, and supertest to create and run tests. Here is a summary of the test implementation:

Initialization: The server is started before running tests and closed afterward. The MongoDB connection lifecycle is managed during tests.
Test Cases:
General: Checks the root endpoint returns status 200 and a welcome message.
Polls: Tests for creating polls and voting on poll options.
Authentication Service: Tests for registering, logging in, and logging out users.
Messaging Service: Tests for sending messages and fetching messages for a chat room.
Test Code Example
javascript
Copy code
import request from 'supertest';
import { expect } from 'chai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { default: mongoose } = require('mongoose');
const { default: app } = require('../server.js'); 

let server;

before((done) => {
    const PORT = process.env.TEST_PORT || 5001;
    server = app.listen(PORT, () => {
        console.log(`Test server running on port ${PORT}`);
        done();
    });
});

after((done) => {
    server.close(() => {
        console.log('Test server closed');
        mongoose.connection.close(done);
    });
});

// Sample test case
describe('GET /', () => {
  it('should return status 200 and a welcome message', (done) => {
    request(server)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.equal('Yap Chat Application');
        done();
      });
  });
});

GitHub Repository
The project is hosted on GitHub and can be accessed via the following link:
[GitHub Repository](https://github.com/daniiltsioma/yap)

Deployment
The Yap Chat Application is deployed and can be accessed at:
[Deployed App](https://yapp-chat-app-de1a44a0cf7e.herokuapp.com/)

Final Notes
This README provides a comprehensive overview of the project's structure, implementation details, and testing setup. The GitHub repository contains all the source code, documentation, and test plans.
