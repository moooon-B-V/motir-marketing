import { describe, expect, it } from 'vitest'
import { LOCALES } from '@/i18n/routing'
import {
  chooseLocale,
  LOCALE_COOKIE,
  matchAcceptLanguage,
} from '@/lib/localeDetection'

/*
 * The first-visit choice (MOTIR-7951): cookie, then Accept-Language, then
 * English. The matcher is motir-core's rule restated, so these cases are the
 * ones that keep the two sites agreeing.
 */

describe('matchAcceptLanguage', () => {
  it('matches each of the eleven by its bare tag', () => {
    for (const locale of LOCALES) {
      expect(matchAcceptLanguage(locale), locale).toBe(locale)
    }
  })

  it.each([
    ['de-AT', 'de'],
    ['pt-BR', 'pt'],
    ['pt-PT', 'pt'],
    ['zh-TW', 'zh'],
    ['zh-Hant-HK', 'zh'],
    ['ja-JP', 'ja'],
    ['JA-jp', 'ja'],
  ])('reads %s as its base language, %s', (header, locale) => {
    expect(matchAcceptLanguage(header)).toBe(locale)
  })

  it('finds nothing for a language motir.co does not speak', () => {
    expect(matchAcceptLanguage('sv')).toBeNull()
    expect(matchAcceptLanguage('sv-SE, nb;q=0.9')).toBeNull()
  })

  it('takes ranges in q order, then header order', () => {
    expect(matchAcceptLanguage('sv, fr;q=0.8')).toBe('fr')
    expect(matchAcceptLanguage('fr;q=0.5, de;q=0.9')).toBe('de')
    expect(matchAcceptLanguage('ko, ja')).toBe('ko')
  })

  it('drops q=0, the wildcard and anything malformed', () => {
    expect(matchAcceptLanguage('fr;q=0, de')).toBe('de')
    expect(matchAcceptLanguage('*')).toBeNull()
    expect(matchAcceptLanguage('*, it;q=0.1')).toBe('it')
    expect(matchAcceptLanguage('not a tag!!, ;;, ja;q=abc')).toBeNull()
    expect(matchAcceptLanguage('12-34, nl')).toBe('nl')
  })

  it('finds nothing in an empty or absent header', () => {
    expect(matchAcceptLanguage('')).toBeNull()
    expect(matchAcceptLanguage(null)).toBeNull()
    expect(matchAcceptLanguage(undefined)).toBeNull()
  })
})

describe('chooseLocale', () => {
  it('names app.motir.co’s cookie', () => {
    expect(LOCALE_COOKIE).toBe('NEXT_LOCALE')
  })

  it('takes the remembered choice over the browser', () => {
    expect(chooseLocale({ cookie: 'fr', acceptLanguage: 'de' })).toBe('fr')
    expect(chooseLocale({ cookie: 'en', acceptLanguage: 'ja' })).toBe('en')
  })

  it('SKIPS a cookie that is not one of the eleven, never defaulting it', () => {
    expect(chooseLocale({ cookie: 'xx', acceptLanguage: 'ja' })).toBe('ja')
    expect(chooseLocale({ cookie: '', acceptLanguage: 'ko' })).toBe('ko')
  })

  it('falls back to English when nothing matches', () => {
    expect(chooseLocale({ cookie: undefined, acceptLanguage: 'sv' })).toBe('en')
    expect(chooseLocale({ cookie: null, acceptLanguage: '*' })).toBe('en')
    expect(chooseLocale({ cookie: undefined, acceptLanguage: null })).toBe('en')
  })
})
