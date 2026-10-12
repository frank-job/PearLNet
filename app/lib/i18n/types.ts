// ============================================================
// i18n Types
// ============================================================

export type LanguageCode =
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt'
  | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'he'
  | 'hi' | 'bn' | 'tr' | 'nl' | 'pl' | 'sv'
  | 'da' | 'fi' | 'no' | 'cs' | 'el' | 'uk';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export interface TranslationKeys {
  // CreatePost
  createPost: string;
  whatHappening: string;
  post: string;
  posting: string;
  addContentOrMedia: string;
  fileTooLarge: string;
  maxImage: string;
  maxVideo: string;
  onlyImagesVideos: string;
  postCreated: string;
  failedToCreatePost: string;
  characterCount: string;
  characterLimit: string;
  // Common
  settings: string;
  account: string;
  news: string;
  logout: string;
  theme: string;
  lightMode: string;
  darkMode: string;
  // Placeholders
  search: string;
  // Errors
  pleaseAddContent: string;
  // Media
  photo: string;
  video: string;
  attach: string;
  remove: string;
}