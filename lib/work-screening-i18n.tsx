"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLanguage } from "@/lib/language-context"

// ==========================================
// Work Screening i18n system
// (mirrors waiver/petition pattern)
// ==========================================

type TranslationMap = Record<string, unknown>
type LocaleCode = string

const translationCache: Record<LocaleCode, TranslationMap> = {}

const builtInLoaders: Record<LocaleCode, () => Promise<TranslationMap>> = {
  en: () => import("@/locales/en/work-screening.json").then((m) => m.default),
  es: () => import("@/locales/es/work-screening.json").then((m) => m.default),
}

export function registerWorkScreeningLanguage(locale: LocaleCode, translations: TranslationMap) {
  translationCache[locale] = translations
}

function resolve(path: string, obj: TranslationMap): string | undefined {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === "string" ? current : undefined
}

export function useWorkScreeningTranslation() {
  const { language } = useLanguage()
  const [ready, setReady] = useState(false)
  const loadedLocaleRef = useRef<string>("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      const locale = language as LocaleCode

      if (translationCache[locale]) {
        if (!cancelled) { loadedLocaleRef.current = locale; setReady(true) }
        return
      }

      const loader = builtInLoaders[locale]
      if (loader) {
        try {
          const data = await loader()
          translationCache[locale] = data
          if (!cancelled) { loadedLocaleRef.current = locale; setReady(true) }
        } catch (err) {
          console.warn(`[work-screening-i18n] Failed to load locale "${locale}":`, err)
          if (!translationCache["en"] && builtInLoaders["en"]) {
            translationCache["en"] = await builtInLoaders["en"]()
          }
          if (!cancelled) { loadedLocaleRef.current = "en"; setReady(true) }
        }
      } else {
        console.warn(`[work-screening-i18n] No translations for locale "${locale}". Falling back to English.`)
        if (!translationCache["en"] && builtInLoaders["en"]) {
          translationCache["en"] = await builtInLoaders["en"]()
        }
        if (!cancelled) { loadedLocaleRef.current = "en"; setReady(true) }
      }
    }

    load()
    return () => { cancelled = true }
  }, [language])

  const t = useCallback(
    (key: string): string => {
      const locale = language as LocaleCode
      const localT = translationCache[locale]
      if (localT) {
        const v = resolve(key, localT)
        if (v !== undefined) return v
      }
      const enT = translationCache["en"]
      if (enT) {
        const v = resolve(key, enT)
        if (v !== undefined) {
          if (locale !== "en") console.warn(`[work-screening-i18n] Missing "${key}" for "${locale}". Using English.`)
          return v
        }
      }
      console.warn(`[work-screening-i18n] Key "${key}" not found.`)
      return key
    },
    [language],
  )

  return { t, locale: language, ready }
}
