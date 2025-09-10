# Port Your Bond UI

React-based web interface for the Port Your Bond conversation processing service.

## Features

- 🔐 **Email Authentication** - Secure access with Supabase OTP verification
- 📁 **File Upload** - Drag & drop JSON conversation files
- 📧 **Email Notifications** - Get notified when processing is complete
- ⚡ **Real-time Status** - Live updates on processing progress
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS

## Setup

### Prerequisites

- Node.js 18+
- Port Your Bond server running on port 3000

### Installation

1. **Install dependencies:**
   ```bash
   cd ui
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your settings
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

## Configuration

### Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:3000)

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Go to Settings > API
3. Copy your Project URL and anon key
4. Add them to your `.env` file
5. Enable Email authentication in Authentication > Settings

### API Endpoints

- `POST /start-port` - Upload and process conversation file
- `GET /job/:jobId` - Check processing status
- `GET /health` - Health check

## Usage

1. **Enter Email** - Your email address for verification
2. **Check Email** - Click the verification link in your email
3. **Return to App** - You'll be automatically verified when you return
4. **Select File** - Choose your conversation JSON file
5. **Click "Start Porting"** - Begin the processing
6. **Wait for Email** - You'll receive a link when complete

## File Format

The UI accepts JSON files with the following structure:

```json
[
  {
    "role": "user",
    "content": "Your message here",
    "timestamp": 1640995200000
  },
  {
    "role": "assistant", 
    "content": "Response message",
    "timestamp": 1640995260000
  }
]
```

## Development

### Project Structure

```
ui/
├── src/
│   ├── App.tsx          # Main app component
│   └── main.tsx         # React entry point
├── PortUploader.tsx     # Upload component
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Styling

The UI uses Tailwind CSS for styling. The design is:
- Dark theme with black/gray colors
- Responsive layout
- Clean, modern interface
- Accessible form controls

## Security

- Email-based magic link authentication via Supabase
- File type validation (JSON only)
- Secure file handling
- Email verification required
- Rate limiting on uploads

## Troubleshooting

### Common Issues

1. **Upload fails** - Check email verification and file format
2. **Processing stuck** - Check server logs
3. **No email received** - Check spam folder
4. **CORS errors** - Ensure server is running on port 3000

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```
