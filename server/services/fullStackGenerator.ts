import { GeneratedFile } from './codeGenerator';

export async function generateSocialPlatform(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  const platformName = extractCompanyName(prompt) || "DevConnect";
  
  return [
    {
      name: 'App.tsx',
      path: '/client/src/App.tsx',
      content: generateSocialApp(platformName),
      language: 'typescript',
      description: 'React social platform application'
    },
    {
      name: 'schema.ts', 
      path: '/shared/schema.ts',
      content: generateSocialSchema(),
      language: 'typescript',
      description: 'Database schema for social features'
    },
    {
      name: 'routes.ts',
      path: '/server/routes.ts', 
      content: generateSocialAPI(),
      language: 'typescript',
      description: 'API endpoints for social platform'
    },
    {
      name: 'main.tsx',
      path: '/client/src/main.tsx',
      content: generateReactMain(),
      language: 'typescript',
      description: 'React application entry point'
    }
  ];
}

export async function generateEcommercePlatform(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  const storeName = extractCompanyName(prompt) || "EliteShop";
  
  return [
    {
      name: 'App.tsx',
      path: '/client/src/App.tsx',
      content: generateEcommerceApp(storeName),
      language: 'typescript',
      description: 'E-commerce React application'
    },
    {
      name: 'schema.ts',
      path: '/shared/schema.ts',
      content: generateEcommerceSchema(),
      language: 'typescript', 
      description: 'E-commerce database schema'
    },
    {
      name: 'routes.ts',
      path: '/server/routes.ts',
      content: generateEcommerceAPI(),
      language: 'typescript',
      description: 'E-commerce API endpoints'
    },
    {
      name: 'main.tsx',
      path: '/client/src/main.tsx',
      content: generateReactMain(),
      language: 'typescript',
      description: 'React application entry point'
    }
  ];
}

export async function generateDashboardApp(prompt: string, projectId: number): Promise<GeneratedFile[]> {
  const dashboardName = extractCompanyName(prompt) || "Analytics Pro";
  
  return [
    {
      name: 'App.tsx',
      path: '/client/src/App.tsx',
      content: generateDashboardApplication(dashboardName),
      language: 'typescript',
      description: 'Analytics dashboard React app'
    },
    {
      name: 'schema.ts',
      path: '/shared/schema.ts',
      content: generateDashboardSchema(),
      language: 'typescript',
      description: 'Dashboard database schema'
    },
    {
      name: 'routes.ts',
      path: '/server/routes.ts',
      content: generateDashboardAPI(),
      language: 'typescript',
      description: 'Dashboard API endpoints'
    },
    {
      name: 'main.tsx',
      path: '/client/src/main.tsx',
      content: generateReactMain(),
      language: 'typescript',
      description: 'React application entry point'
    }
  ];
}

function generateSocialApp(platformName: string): string {
  return `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
}

interface Post {
  id: string;
  user: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  liked?: boolean;
}

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [currentUser] = useState<User>({
    id: '1',
    name: 'John Developer',
    username: '@johndoe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Full-stack developer passionate about React and TypeScript',
    followers: 2847,
    following: 892
  });

  useEffect(() => {
    // Load initial posts
    setPosts([
      {
        id: '1',
        user: {
          id: '2',
          name: 'Sarah Chen',
          username: '@sarahchen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          bio: 'UI/UX Designer & Frontend Developer',
          followers: 1892,
          following: 543
        },
        content: 'Just shipped a new React component library with TypeScript support! The DX improvements are incredible. Check out the interactive documentation and let me know what you think!',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
        likes: 127,
        comments: 23,
        timestamp: '2 hours ago',
        liked: false
      },
      {
        id: '2',
        user: {
          id: '3',
          name: 'Alex Rodriguez',
          username: '@alexdev',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          bio: 'Backend Engineer @ TechCorp',
          followers: 3456,
          following: 234
        },
        content: 'Working on microservices architecture with Node.js and GraphQL. The performance improvements are amazing! Here are some key insights from our implementation...',
        likes: 89,
        comments: 15,
        timestamp: '4 hours ago',
        liked: true
      }
    ]);
  }, []);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;
    
    const post: Post = {
      id: Date.now().toString(),
      user: currentUser,
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: 'now',
      liked: false
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${platformName}
              </h1>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Feed</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Explore</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Jobs</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search developers..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5m0-10h5l-5-5" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-8 h-8 rounded-full ring-2 ring-blue-500 ring-offset-2"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="text-center">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-blue-100"
                />
                <h3 className="font-bold text-gray-900 text-lg">{currentUser.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{currentUser.username}</p>
                <p className="text-sm text-gray-600 mb-4">{currentUser.bio}</p>
                <div className="flex justify-center space-x-8 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-900">{currentUser.followers.toLocaleString()}</div>
                    <div className="text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-900">{currentUser.following.toLocaleString()}</div>
                    <div className="text-gray-600">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-4">Trending in Tech</h3>
              <div className="space-y-3">
                {['#React', '#TypeScript', '#WebDev', '#AI', '#OpenSource'].map((tag, index) => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium">{tag}</span>
                    <span className="text-sm text-gray-500">{Math.floor(Math.random() * 50 + 10)}k posts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Create Post */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6 mb-6"
            >
              <div className="flex space-x-4">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your latest project, insight, or question..."
                    className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-3">
                      <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Photo</span>
                      </button>
                      <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span>Code</span>
                      </button>
                    </div>
                    <button
                      onClick={handlePostSubmit}
                      disabled={!newPost.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-6">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
                  >
                    {/* Post Header */}
                    <div className="p-6 pb-0">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={post.user.avatar} 
                          alt={post.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-gray-900">{post.user.name}</h4>
                            <span className="text-blue-600 font-medium">{post.user.username}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{post.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600">{post.user.bio}</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-6 py-4">
                      <p className="text-gray-900 leading-relaxed mb-4">{post.content}</p>
                      {post.image && (
                        <img 
                          src={post.image}
                          alt="Post content"
                          className="w-full rounded-xl border"
                        />
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="px-6 py-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={\`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors \${post.liked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}\`}
                          >
                            <svg className="w-5 h-5" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-medium">{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-medium">{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            <span className="font-medium">Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;
}

function generateSocialSchema(): string {
  return `import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  avatar: varchar("avatar"),
  bio: text("bio"),
  followers: integer("followers").default(0),
  following: integer("following").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  image: varchar("image"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey(),
  followerId: varchar("follower_id").references(() => users.id).notNull(),
  followingId: varchar("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Follow = typeof follows.$inferSelect;`;
}

function generateSocialAPI(): string {
  return `import { Express } from "express";
import { db } from "./db";
import { users, posts, likes, comments, follows } from "../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export function registerSocialRoutes(app: Express) {
  // Get user feed with posts from followed users
  app.get("/api/feed", async (req, res) => {
    try {
      const { userId } = req.query;
      
      const feedPosts = await db
        .select({
          id: posts.id,
          content: posts.content,
          image: posts.image,
          likes: posts.likes,
          comments: posts.comments,
          shares: posts.shares,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            avatar: users.avatar,
            verified: users.verified,
          },
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .orderBy(desc(posts.createdAt))
        .limit(50);

      res.json(feedPosts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feed" });
    }
  });

  // Create new post
  app.post("/api/posts", async (req, res) => {
    try {
      const { content, image, userId } = req.body;
      
      if (!content?.trim()) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      const [newPost] = await db
        .insert(posts)
        .values({
          id: \`post_\${Date.now()}\`,
          content: content.trim(),
          image,
          userId,
          likes: 0,
          comments: 0,
          shares: 0,
        })
        .returning();

      res.status(201).json(newPost);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Like/unlike post
  app.post("/api/posts/:postId/like", async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;

      // Check if already liked
      const existingLike = await db
        .select()
        .from(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
        .limit(1);

      if (existingLike.length > 0) {
        // Unlike: remove like and decrement counter
        await db
          .delete(likes)
          .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
        
        await db
          .update(posts)
          .set({ likes: sql\`\${posts.likes} - 1\` })
          .where(eq(posts.id, postId));
          
        res.json({ liked: false });
      } else {
        // Like: add like and increment counter
        await db
          .insert(likes)
          .values({
            id: \`like_\${Date.now()}\`,
            postId,
            userId,
          });
        
        await db
          .update(posts)
          .set({ likes: sql\`\${posts.likes} + 1\` })
          .where(eq(posts.id, postId));
          
        res.json({ liked: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update like" });
    }
  });

  // Follow/unfollow user
  app.post("/api/users/:userId/follow", async (req, res) => {
    try {
      const { userId } = req.params;
      const { followerId } = req.body;

      if (userId === followerId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
      }

      const existingFollow = await db
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, userId)))
        .limit(1);

      if (existingFollow.length > 0) {
        // Unfollow
        await db
          .delete(follows)
          .where(and(eq(follows.followerId, followerId), eq(follows.followingId, userId)));
          
        // Update counters
        await db
          .update(users)
          .set({ followers: sql\`\${users.followers} - 1\` })
          .where(eq(users.id, userId));
          
        await db
          .update(users)
          .set({ following: sql\`\${users.following} - 1\` })
          .where(eq(users.id, followerId));
          
        res.json({ following: false });
      } else {
        // Follow
        await db
          .insert(follows)
          .values({
            id: \`follow_\${Date.now()}\`,
            followerId,
            followingId: userId,
          });
          
        // Update counters
        await db
          .update(users)
          .set({ followers: sql\`\${users.followers} + 1\` })
          .where(eq(users.id, userId));
          
        await db
          .update(users)
          .set({ following: sql\`\${users.following} + 1\` })
          .where(eq(users.id, followerId));
          
        res.json({ following: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update follow status" });
    }
  });

  // Get user profile
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's posts
      const userPosts = await db
        .select()
        .from(posts)
        .where(eq(posts.userId, userId))
        .orderBy(desc(posts.createdAt))
        .limit(20);

      res.json({ ...user, posts: userPosts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Search users
  app.get("/api/search/users", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return res.status(400).json({ error: "Search query must be at least 2 characters" });
      }
      
      const searchResults = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          avatar: users.avatar,
          bio: users.bio,
          followers: users.followers,
          verified: users.verified,
        })
        .from(users)
        .where(sql\`
          \${users.name} ILIKE \${'%' + q.trim() + '%'} OR 
          \${users.username} ILIKE \${'%' + q.trim() + '%'}
        \`)
        .limit(20);

      res.json(searchResults);
    } catch (error) {
      res.status(500).json({ error: "Failed to search users" });
    }
  });
}`;
}

function generateReactMain(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
}

function extractCompanyName(prompt: string): string | null {
  const matches = prompt.match(/(?:for|called|named)\\s+([A-Z][a-zA-Z\\s]+(?:Solutions|Inc|LLC|Ltd|Corp|Company)?)/i);
  return matches ? matches[1].trim() : null;
}

function generateEcommerceApp(storeName: string): string {
  return `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    // Load premium electronics products
    setProducts([
      {
        id: '1',
        name: 'iPhone 15 Pro Max',
        price: 1199,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        category: 'smartphones',
        description: 'Latest iPhone with titanium design and A17 Pro chip',
        rating: 4.8,
        reviews: 2847,
        inStock: true
      },
      {
        id: '2', 
        name: 'MacBook Pro 16"',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
        category: 'laptops',
        description: 'Powerful laptop with M3 Max chip for professionals',
        rating: 4.9,
        reviews: 1532,
        inStock: true
      },
      {
        id: '3',
        name: 'AirPods Pro 2',
        price: 249,
        image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
        category: 'audio',
        description: 'Advanced noise cancellation and spatial audio',
        rating: 4.7,
        reviews: 8934,
        inStock: true
      },
      {
        id: '4',
        name: 'iPad Pro 12.9"',
        price: 1099,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        category: 'tablets',
        description: 'Professional tablet with M2 chip and Liquid Retina display',
        rating: 4.8,
        reviews: 3421,
        inStock: true
      }
    ]);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === product.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === product.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(cartItem => cartItem.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(cartItem =>
        cartItem.id === productId ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${storeName}
            </h1>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={\`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors \${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }\`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-xl flex items-center justify-center">
                      <span className="text-white font-bold">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={\`w-4 h-4 \${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}\`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      $\{product.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 mt-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map(cartItem => (
                      <div key={cartItem.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                        <img src={cartItem.image} alt={cartItem.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{cartItem.name}</h4>
                          <p className="text-gray-600">\${cartItem.price}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(cartItem.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-xl font-bold">\${getTotalPrice().toLocaleString()}</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;`;
}

function generateEcommerceSchema(): string {
  return `import { pgTable, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: varchar("image"),
  category: varchar("category").notNull(),
  brand: varchar("brand"),
  sku: varchar("sku").unique(),
  stock: integer("stock").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviews: integer("reviews").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  phone: varchar("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  status: varchar("status").notNull().default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address"),
  billingAddress: text("billing_address"),
  paymentMethod: varchar("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey(),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const cart = pgTable("cart", {
  id: varchar("id").primaryKey(),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;`;
}

function generateEcommerceAPI(): string {
  return `import { Express } from "express";
import { db } from "./db";
import { products, customers, orders, orderItems, cart, reviews } from "../shared/schema";
import { eq, desc, and, sql, ilike } from "drizzle-orm";

export function registerEcommerceRoutes(app: Express) {
  // Get all products with filtering
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, featured, limit = 20 } = req.query;
      
      let query = db.select().from(products);
      
      if (category && category !== 'all') {
        query = query.where(eq(products.category, category as string));
      }
      
      if (search) {
        query = query.where(
          ilike(products.name, \`%\${search}%\`)
        );
      }
      
      if (featured === 'true') {
        query = query.where(eq(products.featured, true));
      }
      
      const result = await query
        .orderBy(desc(products.createdAt))
        .limit(Number(limit));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);
        
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Get reviews for this product
      const productReviews = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          title: reviews.title,
          content: reviews.content,
          createdAt: reviews.createdAt,
          customer: {
            firstName: customers.firstName,
            lastName: customers.lastName,
          }
        })
        .from(reviews)
        .leftJoin(customers, eq(reviews.customerId, customers.id))
        .where(eq(reviews.productId, id))
        .orderBy(desc(reviews.createdAt));
      
      res.json({ ...product, reviews: productReviews });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Add to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const { customerId, productId, quantity } = req.body;
      
      // Check if item already in cart
      const existingItem = await db
        .select()
        .from(cart)
        .where(and(eq(cart.customerId, customerId), eq(cart.productId, productId)))
        .limit(1);
        
      if (existingItem.length > 0) {
        // Update quantity
        await db
          .update(cart)
          .set({ quantity: sql\`\${cart.quantity} + \${quantity}\` })
          .where(and(eq(cart.customerId, customerId), eq(cart.productId, productId)));
      } else {
        // Add new item
        await db
          .insert(cart)
          .values({
            id: \`cart_\${Date.now()}\`,
            customerId,
            productId,
            quantity,
          });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  // Get cart items
  app.get("/api/cart/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      
      const cartItems = await db
        .select({
          id: cart.id,
          quantity: cart.quantity,
          product: {
            id: products.id,
            name: products.name,
            price: products.price,
            image: products.image,
          }
        })
        .from(cart)
        .leftJoin(products, eq(cart.productId, products.id))
        .where(eq(cart.customerId, customerId));
      
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const { customerId, items, total, shippingAddress, billingAddress, paymentMethod } = req.body;
      
      // Create order
      const [order] = await db
        .insert(orders)
        .values({
          id: \`order_\${Date.now()}\`,
          customerId,
          status: "pending",
          total,
          shippingAddress,
          billingAddress,
          paymentMethod,
        })
        .returning();
      
      // Add order items
      const orderItemsData = items.map((item: any) => ({
        id: \`item_\${Date.now()}_\${item.productId}\`,
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));
      
      await db.insert(orderItems).values(orderItemsData);
      
      // Clear cart
      await db.delete(cart).where(eq(cart.customerId, customerId));
      
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get customer orders
  app.get("/api/orders/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      
      const customerOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.customerId, customerId))
        .orderBy(desc(orders.createdAt));
      
      res.json(customerOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Add product review
  app.post("/api/reviews", async (req, res) => {
    try {
      const { productId, customerId, rating, title, content } = req.body;
      
      const [review] = await db
        .insert(reviews)
        .values({
          id: \`review_\${Date.now()}\`,
          productId,
          customerId,
          rating,
          title,
          content,
        })
        .returning();
      
      // Update product rating
      const allReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.productId, productId));
      
      const avgRating = allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / allReviews.length;
      
      await db
        .update(products)
        .set({ 
          rating: avgRating.toFixed(2),
          reviews: allReviews.length 
        })
        .where(eq(products.id, productId));
      
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to add review" });
    }
  });

  // Get categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await db
        .selectDistinct({ category: products.category })
        .from(products)
        .where(sql\`\${products.category} IS NOT NULL\`);
      
      res.json(categories.map(c => c.category));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
}`;
}

function generateDashboardApplication(dashboardName: string): string {
  return `import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

function App() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Load dashboard metrics
    setMetrics([
      {
        title: 'Total Revenue',
        value: '$124,532',
        change: 12.5,
        icon: '💰',
        color: 'from-green-400 to-green-600'
      },
      {
        title: 'Active Users',
        value: '8,429',
        change: 8.2,
        icon: '👥',
        color: 'from-blue-400 to-blue-600'
      },
      {
        title: 'Conversion Rate',
        value: '3.24%',
        change: -2.1,
        icon: '📈',
        color: 'from-purple-400 to-purple-600'
      },
      {
        title: 'Page Views',
        value: '45,892',
        change: 15.3,
        icon: '👁️',
        color: 'from-orange-400 to-orange-600'
      }
    ]);

    setChartData([
      { name: 'Direct', value: 35, color: '#3B82F6' },
      { name: 'Social', value: 25, color: '#10B981' },
      { name: 'Email', value: 20, color: '#F59E0B' },
      { name: 'Organic', value: 15, color: '#8B5CF6' },
      { name: 'Paid', value: 5, color: '#EF4444' }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">${dashboardName}</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening.</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={\`w-12 h-12 bg-gradient-to-r \${metric.color} rounded-lg flex items-center justify-center text-2xl\`}>
                  {metric.icon}
                </div>
                <div className={\`flex items-center \${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={metric.change >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                  <span className="text-sm font-medium">{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">{metric.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
              <div className="h-64 flex items-end space-x-2">
                {[65, 45, 78, 52, 89, 67, 43, 76, 54, 82, 91, 68, 75, 58].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: \`\${height}%\` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-md min-h-[20px]"
                  />
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-4">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </motion.div>
          </div>

          {/* Traffic Sources */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: \`\${item.value}%\` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-xl shadow-sm border"
        >
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { action: 'New user registered', user: 'john.doe@example.com', time: '2 minutes ago', type: 'user' },
                { action: 'Payment received', user: '$2,500 from Enterprise Plan', time: '5 minutes ago', type: 'payment' },
                { action: 'Feature request submitted', user: 'sarah.chen@company.com', time: '12 minutes ago', type: 'feature' },
                { action: 'Bug report resolved', user: 'Issue #1247', time: '25 minutes ago', type: 'bug' },
                { action: 'API rate limit reached', user: 'api.partner.com', time: '1 hour ago', type: 'warning' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg">
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${
                    activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                    activity.type === 'feature' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'bug' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }\`}>
                    {activity.type === 'user' ? '👤' :
                     activity.type === 'payment' ? '💳' :
                     activity.type === 'feature' ? '✨' :
                     activity.type === 'bug' ? '🐛' : '⚠️'}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.action}</p>
                    <p className="text-gray-600 text-sm">{activity.user}</p>
                  </div>
                  <span className="text-gray-500 text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;`;
}

function generateDashboardSchema(): string {
  return `import { pgTable, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey(),
  metric: varchar("metric").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  category: varchar("category"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey(),
  type: varchar("type").notNull(),
  action: varchar("action").notNull(),
  userId: varchar("user_id"),
  metadata: text("metadata"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  config: text("config"),
  schedule: varchar("schedule"),
  lastRun: timestamp("last_run"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  layout: text("layout"),
  widgets: text("widgets"),
  isDefault: boolean("is_default").default(false),
  ownerId: varchar("owner_id"),
  shared: boolean("shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Analytic = typeof analytics.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Dashboard = typeof dashboards.$inferSelect;`;
}

function generateDashboardAPI(): string {
  return `import { Express } from "express";
import { db } from "./db";
import { analytics, activities, reports, dashboards } from "../shared/schema";
import { eq, desc, sql, gte, between } from "drizzle-orm";

export function registerDashboardRoutes(app: Express) {
  // Get analytics metrics
  app.get("/api/analytics", async (req, res) => {
    try {
      const { metric, timeRange = '7d', category } = req.query;
      
      let startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(startDate.getDate() - days);
      
      let query = db
        .select()
        .from(analytics)
        .where(gte(analytics.date, startDate))
        .orderBy(desc(analytics.date));
      
      if (metric) {
        query = query.where(eq(analytics.metric, metric as string));
      }
      
      if (category) {
        query = query.where(eq(analytics.category, category as string));
      }
      
      const data = await query.limit(1000);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get dashboard summary
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const { timeRange = '7d' } = req.query;
      
      let startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(startDate.getDate() - days);
      
      // Get key metrics
      const revenue = await db
        .select({ 
          total: sql\`SUM(CAST(\${analytics.value} AS NUMERIC))\`,
          count: sql\`COUNT(*)\`
        })
        .from(analytics)
        .where(
          sql\`\${analytics.metric} = 'revenue' AND \${analytics.date} >= \${startDate}\`
        );
      
      const users = await db
        .select({ 
          total: sql\`COUNT(DISTINCT \${analytics.metadata})\`
        })
        .from(analytics)
        .where(
          sql\`\${analytics.metric} = 'active_users' AND \${analytics.date} >= \${startDate}\`
        );
      
      const pageViews = await db
        .select({ 
          total: sql\`SUM(CAST(\${analytics.value} AS NUMERIC))\`
        })
        .from(analytics)
        .where(
          sql\`\${analytics.metric} = 'page_views' AND \${analytics.date} >= \${startDate}\`
        );
      
      res.json({
        revenue: revenue[0]?.total || 0,
        users: users[0]?.total || 0,
        pageViews: pageViews[0]?.total || 0,
        timeRange
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // Record analytics event
  app.post("/api/analytics", async (req, res) => {
    try {
      const { metric, value, category, metadata } = req.body;
      
      await db
        .insert(analytics)
        .values({
          id: \`analytics_\${Date.now()}\`,
          metric,
          value: value.toString(),
          category,
          metadata: metadata ? JSON.stringify(metadata) : null,
          date: new Date(),
        });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record analytics" });
    }
  });

  // Get recent activities
  app.get("/api/activities", async (req, res) => {
    try {
      const { limit = 50, type } = req.query;
      
      let query = db
        .select()
        .from(activities)
        .orderBy(desc(activities.createdAt))
        .limit(Number(limit));
      
      if (type) {
        query = query.where(eq(activities.type, type as string));
      }
      
      const result = await query;
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Log activity
  app.post("/api/activities", async (req, res) => {
    try {
      const { type, action, userId, metadata } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');
      
      await db
        .insert(activities)
        .values({
          id: \`activity_\${Date.now()}\`,
          type,
          action,
          userId,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ipAddress,
          userAgent,
        });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to log activity" });
    }
  });

  // Get reports
  app.get("/api/reports", async (req, res) => {
    try {
      const { active = true } = req.query;
      
      let query = db.select().from(reports);
      
      if (active === 'true') {
        query = query.where(eq(reports.isActive, true));
      }
      
      const result = await query.orderBy(desc(reports.createdAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Create report
  app.post("/api/reports", async (req, res) => {
    try {
      const { name, type, config, schedule } = req.body;
      
      const [report] = await db
        .insert(reports)
        .values({
          id: \`report_\${Date.now()}\`,
          name,
          type,
          config: config ? JSON.stringify(config) : null,
          schedule,
          isActive: true,
        })
        .returning();
      
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  // Get dashboards
  app.get("/api/dashboards", async (req, res) => {
    try {
      const { ownerId } = req.query;
      
      let query = db.select().from(dashboards);
      
      if (ownerId) {
        query = query.where(eq(dashboards.ownerId, ownerId as string));
      }
      
      const result = await query.orderBy(desc(dashboards.createdAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboards" });
    }
  });

  // Save dashboard
  app.post("/api/dashboards", async (req, res) => {
    try {
      const { name, layout, widgets, isDefault, ownerId, shared } = req.body;
      
      const [dashboard] = await db
        .insert(dashboards)
        .values({
          id: \`dashboard_\${Date.now()}\`,
          name,
          layout: layout ? JSON.stringify(layout) : null,
          widgets: widgets ? JSON.stringify(widgets) : null,
          isDefault: isDefault || false,
          ownerId,
          shared: shared || false,
        })
        .returning();
      
      res.status(201).json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to save dashboard" });
    }
  });
}`;
}