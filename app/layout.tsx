import { NextAuthProvider } from "@/components/NextAuthProvider";
import "./globals.css";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export const metadata = {
  title: "Readme Generator",
  description:
    "This project is a Readme Generator that provides a simple and easy way to create a professional Readme file.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  console.log(session);
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
