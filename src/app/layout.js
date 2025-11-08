// app/layout.js

import { AuthProvider } from "../context/AuthContext.js";
import "./globals.css"; // This file is now provided

export const metadata = {
  title: "Family Tree App",
  description: "Build your family tree",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
