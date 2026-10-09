/*
 * The props a page under `app/[locale]` receives on an English address
 * (MOTIR-7948). English is unprefixed, so every route a test renders by its
 * plain path is the `en` tree; pass this to a page whose only segment is the
 * locale, or spread `{ locale: 'en' }` into a page's own params.
 */
export const EN_PAGE = { params: Promise.resolve({ locale: 'en' }) }
