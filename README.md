# ⚾ Baseball Social

A full-featured social media platform built specifically for baseball fans. Share your love for America's pastime, connect with fellow fans, and celebrate the game together.

## Features

### Core Social Media Features
- **User Authentication** - Secure sign up and sign in with credentials
- **User Profiles** - Customizable profiles with bio, favorite team, favorite player, and location
- **Posts** - Share text posts, images, and videos with captions
- **Hashtags & Mentions** - Use #hashtags and @mentions to connect and categorize content
- **Likes & Comments** - Interact with posts through likes and comments
- **Follow System** - Follow other users to see their content in your feed
- **Notifications** - Real-time notifications for likes, comments, follows, and mentions
- **Discover** - Search for users, posts, and hashtags
- **Infinite Scroll Feed** - Browse through posts with seamless infinite scrolling

### Baseball-Specific Features
- **Favorite Team** - Set and display your favorite MLB team
- **Favorite Player** - Showcase your favorite player
- **Team & Player Mentions** - Tag teams and players in your posts

### Advanced Features
- **Explore Page** - Personalized content recommendations based on your preferences
  - **Recommended Feed** - Posts from users you follow and content matching your interests
  - **Trending** - See what's hot with trending hashtags and popular posts
  - **Suggested Users** - Discover users with similar interests (same team, location, etc.)
- **Saved Posts** - Bookmark posts to view later
- **Hashtag Pages** - Dedicated pages for each hashtag showing all related posts
- **Post Saving** - Save/bookmark posts for later viewing
- **Enhanced Search** - Filter by users or posts

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **File Upload**: Cloudinary for image and video storage
- **UI Components**: Radix UI, Lucide Icons, Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Cloudinary account (for image/video uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BaseballSocial
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/baseball_social?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Cloudinary (for image/video uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Project Structure

```
BaseballSocial/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main app pages (requires auth)
│   │   ├── profile/       # User profile pages
│   │   ├── discover/      # Search/discover page
│   │   ├── create/        # Create post page
│   │   └── notifications/ # Notifications page
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication routes
│   │   ├── posts/         # Post-related routes
│   │   ├── users/         # User-related routes
│   │   ├── notifications/ # Notification routes
│   │   └── search/        # Search routes
│   └── auth/              # Authentication pages
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Prisma schema and client
└── types/                 # TypeScript type definitions
```

## Key Features Implementation

### Authentication
- Uses NextAuth.js with credentials provider
- Password hashing with bcryptjs
- JWT-based sessions
- Protected routes with middleware

### Posts
- Support for text, images, and videos
- Hashtag and mention extraction from content
- Like and comment functionality
- Real-time updates

### User Profiles
- Customizable bio, location, favorite team, and player
- Follow/unfollow functionality
- Post count, follower count, following count
- Edit profile page

### Notifications
- Push notifications for likes, comments, follows, and mentions
- Unread notification count
- Mark as read functionality

### Search & Discover
- Search users by username or name
- Search posts by content or hashtags
- Filter by type (all, users, posts)

## Database Schema

The app uses PostgreSQL with the following main models:
- **User** - User accounts and profiles
- **Post** - User posts with content, images, videos, hashtags, mentions
- **Like** - Post likes
- **Comment** - Post comments
- **SavedPost** - Bookmarked/saved posts
- **Follow** - User follow relationships
- **Notification** - User notifications

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

This project is open source and available under the MIT License.

## Pages & Routes

### Public Pages
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page

### Protected Pages (requires authentication)
- `/` - Home feed with all posts
- `/discover` - Search for users and posts
- `/explore` - Personalized recommendations, trending content, and suggested users
- `/create` - Create a new post
- `/saved` - View your saved/bookmarked posts
- `/notifications` - View and manage notifications
- `/profile/[username]` - User profile page
- `/profile/[username]/edit` - Edit your profile
- `/hashtag/[tag]` - View all posts with a specific hashtag

## Future Enhancements

- Real-time messaging/chat
- Story/status feature
- Live game scores integration
- Team-specific feeds
- Player statistics integration
- Video streaming optimization
- Dark mode
- Post drafts
- Advanced analytics
- Activity feed showing what followers are doing
- Post filtering and sorting options
- Mobile app version

---

Built with ⚾ and ❤️ for baseball fans everywhere!