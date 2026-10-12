"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"

export default function HomePage() {
  const t = useTranslations("HomePage")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <Link
        href="/users"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        {t("usersLink")}
      </Link>
    </div>
  )
}
