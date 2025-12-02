import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <span className="text-sm text-gray-700">KnockRead</span>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
