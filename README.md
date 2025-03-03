# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/bde1920f-4a4e-4d20-8c3a-128334b357db

## Technologies Used

This project is built with:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Getting Started

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Local Development Setup

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
```

2. Navigate to the project directory:
```sh
cd <YOUR_PROJECT_NAME>
```

3. Install dependencies:
```sh
npm i
```

4. Start the development server:
```sh
npm run dev
```

## Authentication Setup

To enable authentication in your project, you'll need to configure OAuth providers in your Supabase project:

### Google OAuth Setup
1. Go to your Supabase dashboard
2. Navigate to Authentication > Providers
3. Enable Google OAuth
4. Configure the following:
   - Add your Google Client ID and Secret
   - Set up the authorized redirect URI in Google Cloud Console

### GitHub OAuth Setup
1. Go to your Supabase dashboard
2. Navigate to Authentication > Providers
3. Enable GitHub OAuth
4. Configure the following:
   - Add your GitHub Client ID and Secret
   - Set up the authorized redirect URI in GitHub OAuth settings

## Deployment Options

### Using Lovable
1. Open [Lovable](https://lovable.dev/projects/bde1920f-4a4e-4d20-8c3a-128334b357db)
2. Click on Share -> Publish

### Custom Domain Deployment
We don't support custom domains (yet). If you want to deploy your project under your own domain, we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Development Methods

### Using Lovable
Visit the [Lovable Project](https://lovable.dev/projects/bde1920f-4a4e-4d20-8c3a-128334b357db) and start prompting. Changes made via Lovable will be committed automatically to this repo.

### Using Your IDE
Clone this repo and push changes. Pushed changes will be reflected in Lovable.

### GitHub Direct Editing
1. Navigate to the desired file(s)
2. Click the "Edit" button (pencil icon)
3. Make your changes and commit

### GitHub Codespaces
1. Navigate to the main page of your repository
2. Click on the "Code" button (green button)
3. Select the "Codespaces" tab
4. Click on "New codespace"
5. Edit files directly within the Codespace
6. Commit and push your changes when done
