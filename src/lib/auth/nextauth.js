import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    }),
    // Uncomment when you have Google OAuth credentials
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      
      if (account?.provider === 'google') {
        token.oauthProvider = 'google';
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.oauthProvider = token.oauthProvider;
      }
      return session;
    },
    
    async signIn({ user, account, profile }) {
      await connectDB();
      
      // Handle OAuth sign in
      if (account?.provider === 'google') {
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user from OAuth
          await User.create({
            email: user.email,
            name: user.name || profile?.name,
            oauthProvider: 'google',
            oauthId: account.providerAccountId,
            emailVerified: true,
          });
        }
      }
      
      return true;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};
