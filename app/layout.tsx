import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">Job Management System</Link>
            <div className="space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/jobs">Job History</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/calendar">Calendar</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/emails">Emails</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/user">User Profile</Link>
              </Button>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}

