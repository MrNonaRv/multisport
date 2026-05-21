# Thesis Defense: Potential Questions & Answers for the Sports Management System

Here is a compiled list of likely questions the panel might ask during your thesis defense, along with the most appropriate answers based on how your system is built.

## 1. System Objectives & Features

**Q: What is the main objective of this sports management system?**
**A:** The main objective is to provide a centralized, digital platform for managing multi-sport events (like intramurals). It eliminates manual paper-based tabulation by handling team registrations, player rosters, match scheduling, live score tracking, and automated tournament bracket progression. 

**Q: With so many different sports, how does the system handle different scoring rules?**
**A:** The system features a dynamic "Live Match Control" module. When a match is launched, the system checks the sport type (e.g., Basketball vs. Volleyball vs. Arnis). The UI automatically adapts, loading specific quick-action buttons (like '+2 Points' for Basketball, 'Ace' for Volleyball, or 'Strike' for Arnis). It also has conditional logic in the backend to determine if a sport is won by overall points (Basketball) or by Sets/Rounds (Volleyball, Arnis, Taekwondo).

## 2. Technical Architecture

**Q: Can you explain the "Semi-Automatic Progression" you implemented in the tournament brackets?**
**A:** In our semi-automatic approach, administrators only need to manually set up the initial matchups for the first round (e.g., Quarter-Finals) in the Brackets dashboard. They do not update scores on the bracket screen directly. Instead, scores are updated in the Live Matches tab. Once a match is saved as "Completed" and a winner is declared, the system automatically detects the outcome and pushes the winning team to the next available slot in the bracket (e.g., moving them from Quarter-Finals to Semi-Finals).

**Q: What technologies did you use to build this system and why?**
**A:** The system is built using React and TypeScript for the frontend. React allows for a fast, responsive, and component-based user interface, which is essential for real-time live scoring and dynamic dashboards. TypeScript enforces strict data typing, which reduces bugs and errors—especially since we are managing complex data relationships between teams, players, matches, and brackets.

**Q: How and where is the data stored?**
**A:** Currently, the system uses a centralized `DatabaseContext` that simulates a database by persisting data in the browser's LocalStorage. This means data is saved locally for demonstration and testing. However, the system's architecture isolates all database functions inside this context, meaning it can be easily connected to a real cloud database (like Firebase or PostgreSQL) in the future without changing the frontend UI code.

## 3. Data Integrity & Usability

**Q: How does the system handle the separation of Men's and Women's divisions?**
**A:** Players are assigned a gender upon registration. When scheduling a match, the admin selects the specific category (e.g., "Men's Division" or "Women's Division"). The system uses this category to filter and ensure that only the correct players (Boys or Girls) are displayed on the rosters and eligible for point attribution during the live match control.

**Q: What happens if an administrator makes a mistake during live scoring?**
**A:** The system prioritizes flexibility and error correction. If a quick-action button is pressed by mistake, the administrator can close the live control modal and use the dedicated "Edit Score" function to manually override and fix the points or sets for any ongoing match. 

**Q: How does the system differentiate between normal users and administrators?**
**A:** The system implements role-based access control. Guests and regular users only see the public-facing pages: the Home page for live updates, the Sport pages for schedules and brackets, and the Archives for past game history. Access to the Admin Dashboard (where data entry, live match control, and configurations occur) requires a secure login using administrator or tabulator credentials.

**Q: Why did you add an "Archives" section?**
**A:** The Archives section ensures historical data preservation. Once tournaments end, users and players often want to look back at past match results, scores, and records. The archive consolidates all completed games across all sports into one easily filterable view, serving as the official digital record of the event.
