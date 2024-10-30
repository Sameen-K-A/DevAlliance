# DevAlliance

**DevAlliance** is a collaborative coding platform designed for developers to work together in real time, share ideas, and build projects in an interactive environment. Built to facilitate smooth, efficient coding sessions, DevAlliance provides a suite of features aimed at enhancing productivity and fostering team synergy. Users can create or join rooms, code together, share outputs, and communicate effectively through integrated chat and audio functions. The platform supports a range of programming languages with customized version tracking, offering an inclusive and powerful tool for collaborative development.

---

## Project Overview

### Introduction

DevAlliance emphasizes the power of teamwork in software development, allowing multiple developers to come together, code in real-time, and bring their ideas to life. The project focuses on ease of use and intuitive functionality, making it suitable for both professional collaboration and educational purposes. The coding screen allows developers to code, execute, and view results immediately, facilitating a smooth, interactive coding experience.

---

## Development Timeline

### Day 01 - Initial Setup and Coding Screen

**Current Progress**:  

- **Coding Screen Complete**: The coding screen has been successfully implemented, enabling users to write code, execute it, and see the results in real-time. This feature enhances the core functionality of DevAlliance by providing a seamless coding and debugging experience for users.
- **Piston API Integration**: Integrated the Piston API for executing code snippets in various programming languages, allowing for immediate feedback on code execution.
- **Monaco Editor Implementation**: Incorporated Monaco Editor for an enhanced coding experience, offering features like syntax highlighting, autocompletion, and error detection.

### Day 02 - Backend and Real-Time Communication

**New Progress**:

- **Backend Setup with Express Server**: Set up an Express.js server to manage backend functionality, including room creation, joining, and managing user sessions.
- **Socket.io Integration**: Implemented Socket.io for real-time communication, allowing seamless connections and instant updates among users in the same room. This enables live code updates, real-time chat, and collaborative interactions.
- **Room Management**: Developed room creation and joining functionalities to organize collaborative sessions easily, allowing users to invite up to 5 members to each room.
- **Chat Feature with Emoji Support**: Created an in-room chat feature to facilitate smooth communication among participants. Integrated `emoji-picker-react` for emoji selection, enhancing expressiveness in messages.
- **Real-Time Code Updates with Output and Error Management**: Completed the functionality to synchronize code, output, and error handling in real-time for all members within a room. Each user sees immediate updates to the code and the corresponding output or error messages, ensuring that the entire team is on the same page during development.

### Day 03 - User Management and Clean-Up Features

**New Progress**:

- **User Listing in Rooms**: Implemented a feature to display a list of users currently in the room, similar to Google Meet. This allows participants to see who is active in the session and enhances collaboration.
- **Leave Modal**: Developed a modal prompt that appears when a user attempts to leave the room, confirming the action and ensuring that users don’t accidentally exit the session.
- **Members Listing**: Created a dedicated section to list all members in the room, providing information such as their usernames and status, enhancing the collaborative experience.
- **Access User System Mic**: Integrated functionality to allow users to access and manage their system microphone settings, promoting effective audio communication during sessions.
- **Code Clean-Up Functionality**: Implemented a feature for code clean-up, allowing users to format and organize their code within the editor for better readability and maintenance.

---

Stay tuned for upcoming updates as I continue to add features and refine the platform!
