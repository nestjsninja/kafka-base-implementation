import './global.css';

export const metadata = {
  title: 'Kafka Demo Dashboard',
  description: 'Local dashboard for the Kafka NestJS demo',
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
