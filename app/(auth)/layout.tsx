import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50">
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold">
          MergenFlow
        </Link>
      </div>
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  )
}
