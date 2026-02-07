"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLanguage } from "@/lib/language-context"

// ==========================================
// Waiver-specific i18n system
// ==========================================
// - Lazy-loads translation files per locale
// - English fallback with console warning on missing keys
// - registerLanguage() for future locale expansion
// - Reads language from the existing LanguageProvider
// - Scoped to the Waiver Wizard only
// ==========================================

type TranslationMap = Record<string, unknown>
type LocaleCode = string

// Registry: locale → translations (lazy-loaded or manually registered)
const translationCache: Record<LocaleCode, TranslationMap> = {}

// Built-in loaders for bundled locales
const builtInLoaders: Record<LocaleCode, () => Promise<TranslationMap>> = {
  en: () => import("@/locales/en/waiver.json").then((m) => m.default),
  es: () => import("@/locales/es/waiver.json").then((m) => m.default),
}

/**
 * Register a new language at runtime.
 * Usage: registerLanguage("fr", { header: { title: "..." }, ... })
 */
export function registerLanguage(locale: LocaleCode, translations: TranslationMap) {
  translationCache[locale] = translations
}

/**
 * Resolve a dot-path key from a nested object.
 * e.g. resolve("step1.heading", obj) → obj.step1.heading
 */
function resolve(path: string, obj: TranslationMap): string | undefined {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === "string" ? current : undefined
}

/**
 * Hook: useWaiverTranslation
 *
 * Returns:
 *   t(key)    – translate a dot-path key (e.g. "step1.heading")
 *   locale    – current locale code
 *   ready     – true once translations are loaded
 */
export function useWaiverTranslation() {
  const { language } = useLanguage()
  const [ready, setReady] = useState(false)
  const loadedLocaleRef = useRef<string>("")

  // Lazy-load translations when language changes
  useEffect(() => {
    let cancelled = false

    async function load() {
      const locale = language as LocaleCode

      // Already cached
      if (translationCache[locale]) {
        if (!cancelled) {
          loadedLocaleRef.current = locale
          setReady(true)
        }
        return
      }

      // Try built-in loader
      const loader = builtInLoaders[locale]
      if (loader) {
        try {
          const data = await loader()
          translationCache[locale] = data
          if (!cancelled) {
            loadedLocaleRef.current = locale
            setReady(true)
          }
        } catch (err) {
          console.warn(`[waiver-i18n] Failed to load locale "${locale}":`, err)
          // Fallback: ensure English is loaded
          if (!translationCache["en"] && builtInLoaders["en"]) {
            translationCache["en"] = await builtInLoaders["en"]()
          }
          if (!cancelled) {
            loadedLocaleRef.current = "en"
            setReady(true)
          }
        }
      } else {
        // Unknown locale with no registered translations
        console.warn(`[waiver-i18n] No translations registered for locale "${locale}". Falling back to English.`)
        if (!translationCache["en"] && builtInLoaders["en"]) {
          translationCache["en"] = await builtInLoaders["en"]()
        }
        if (!cancelled) {
          loadedLocaleRef.current = "en"
          setReady(true)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [language])

  const t = useCallback(
    (key: string): string => {
      const locale = language as LocaleCode

      // Try current locale first
      const localTranslations = translationCache[locale]
      if (localTranslations) {
        const value = resolve(key, localTranslations)
        if (value !== undefined) return value
      }

      // Fallback to English
      const enTranslations = translationCache["en"]
      if (enTranslations) {
        const value = resolve(key, enTranslations)
        if (value !== undefined) {
          if (locale !== "en") {
            console.warn(`[waiver-i18n] Missing key "${key}" for locale "${locale}". Using English fallback.`)
          }
          return value
        }
      }

      // Last resort: return the key itself
      console.warn(`[waiver-i18n] Translation key "${key}" not found in any locale.`)
      return key
    },
    [language],
  )

  return { t, locale: language, ready }
}
