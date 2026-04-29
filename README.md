# MultiSports Tournament Management System

A full-featured tournament management system built with React, TypeScript, and Tailwind CSS.

## Features

- **Live Match Control:** Real-time score and clock updates for multiple sports.
- **Sport-Specific Stats:** Track points, rebounds, assists, fouls, and more.
- **Bracket Management:** View and manage tournament progress.
- **Staff Dashboard:** Secure area for admins and tabulators to manage teams, players, and matches.
- **Local Persistence:** Data is saved to your browser's local storage.

## Local Setup

To run this application on your local machine, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. **Clone or Download** the project files to your computer.
2. Open a terminal/command prompt in the project directory.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production-ready build:
```bash
npm run build
```
The output will be in the `dist` folder.

## Technologies Used

### Front-End
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **Motion** (Animations)

### Back-End / Storage
- **Local Storage** (Browser-based persistence, no external server used)
