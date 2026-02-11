import './globals.css';

export const metadata = {
  title: 'Fleet Manager | Roofing Pros USA',
  description: 'Project Manager Truck Assignment System',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
