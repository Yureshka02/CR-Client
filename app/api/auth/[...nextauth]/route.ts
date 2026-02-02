import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

const handler = NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET || "",
      issuer: process.env.COGNITO_ISSUER!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // Save the Cognito id_token/access_token inside NextAuth JWT
      if (account) {
        (token as any).id_token = (account as any).id_token;
        (token as any).access_token = (account as any).access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Make token available server-side (we’ll use it in proxy)
      (session as any).id_token = (token as any).id_token;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
