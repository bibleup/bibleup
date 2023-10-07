export interface Options {
  version: Version
  popup: 'classic' | 'inline' | 'wiki'
  darkTheme: boolean
  bu_ignore: string[]
  bu_allow: string[]
  buid: string
  bu_id?: string
  ignoreCase: boolean
  styles: Partial<Styles>
}

export interface Styles {
  primary: string
  secondary: string
  tertiary: string
  borderRadius: string
  boxShadow: string
  fontSize: string
  fontColor: string
  headerColor: string
  versionColor: string
  closeColor: string
}

export interface Regex {
  main: RegExp
  verse: RegExp
}

export interface BibleData {
  book: string
  chapter: string
  verse: string
  verseEnd: string
  version?: string | false
}

export interface BibleRef {
  ref: string
  book: string
  chapter: number
  verse: number
  verseEnd: number | undefined
  apiBook: string
  version?: string
}

export interface BibleFetch {
  ref: string
  version: string
  refData: {
    book: string
    chapter: number
    startVerse: number
    endVerse: number | undefined
  }
  apiBook: string
  text: string[] | null
}

export interface Popup {
  container: HTMLElement
  header: HTMLElement | null
  ref: HTMLElement | null
  version: HTMLElement | null
  content: HTMLElement | null
  text: HTMLElement
  close: HTMLElement | null
}

export type Trigger = Partial<{
  version: boolean
  popup: boolean
  style: boolean
}>

export interface BibleApiResponse {
  data: {
    content: string
  }
}

export type BollsApiResponse = Array<Array<{ text: string }>>

export interface SupportedVersions {
  bibleApi: BibleApi[]
  bolls: Bolls[]
  all: Version[]
}

type BibleApi = 'KJV' | 'ASV' | 'LSV' | 'WEB'
type Bolls = 'ESV' | 'NIV' | 'MSG' | 'NLT'
type Version = BibleApi | Bolls
