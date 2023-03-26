import "./globals.css";

export const metadata = {
  title: "Readme Generator",
  description:
    "This project is a Readme Generator that provides a simple and easy way to create a professional Readme file.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
