import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          // I wish to request additional permission scopes.
          scope: "repo read:user user:email",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token = Object.assign({}, token, {
          access_token: account.access_token,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session) {
        session = Object.assign({}, session, {
          access_token: token.access_token,
        });
        console.log(session);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const productionDomain = "https://read-gen.vercel.app";
      const redirectUrl = url.replace(baseUrl, productionDomain);

      return redirectUrl;
    },
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
