import 'server-only'

const dictionaries = {
  en: () => import('../messages/en.json').then((module) => module.default),
  hi: () => import('../messages/hi.json').then((module) => module.default),
  sa: () => import('../messages/sa.json').then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
  return dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.en()
}
