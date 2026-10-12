"use client"
import { Link, usePathname, useRouter } from '@/src/i18n/navigation'
import { useLocale } from 'next-intl'
import React from 'react'

const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleChangeLang = (lang: string) => {
    router.replace(pathname, { locale: lang })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-black/60">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-semibold transition-colors hover:text-blue-600 ${
              pathname === "/" ? "text-blue-600" : "text-gray-600 dark:text-gray-300"
            }`}
          >
            Home
          </Link>
          <Link
            href="/users"
            className={`text-sm font-semibold transition-colors hover:text-blue-600 ${
              pathname.startsWith("/users")
                ? "text-blue-600"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            Users
          </Link>
        </div>

        <select
          value={locale}
          onChange={(e) => handleChangeLang(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <option value="en">En</option>
          <option value="ru">Ru</option>
        </select>
      </nav>
    </header>
  )
}

export default Navbar
