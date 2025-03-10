# Simple Box AI Chatbot

A modern, elegant chatbot application built with Next.js, TypeScript, and Box AI.

## Features

- Beautiful, clean UI for chatting with Box AI
- Light and dark mode support with theme persistence
- Messages stored in local storage (no database required)
- Token caching for Box API to minimize authentication requests
- Fully responsive design
- Loading indicators and visual feedback
- Markdown support for AI responses
- Copy-to-clipboard functionality

## Prerequisites

- Node.js (v18 or newer)
- Box Enterprise account with API access
- Box AI enabled for your enterprise

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/simple-box-ai-chatbot.git
   cd simple-box-ai-chatbot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Box API credentials:
   ```
   BOX_ENTERPRISE_ID=your_enterprise_id
   BOX_CLIENT_ID=your_client_id
   BOX_CLIENT_SECRET=your_client_secret
   BOX_DUMMY_FILE_ID=your_box_dummy_file_because_text_gen_demands_it_even_if_it_does_not_use_it
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

- The frontend is built with Next.js and React
- Messages are stored in the browser's localStorage
- API requests to Box AI are handled through a Next.js API route
- Authentication tokens are cached for up to 55 minutes to minimize API calls
- Theme preferences are stored in localStorage for persistence
- Adaptive UI with smooth transitions between light and dark modes
- Responsive design adapts to mobile, tablet, and desktop screens

## License

[MIT](LICENSE)
