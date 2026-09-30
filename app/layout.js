import "./globals.css";

export const metadata = {
  title: "Project Tracker - Input Data",
  description: "Form input project langsung ke Google Sheets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
