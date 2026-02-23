# BookExplorer

A React Native mobile app built with Expo and TypeScript that lets users discover books, search by title or author, view detailed book info, and track their reading list.

---
## Download live app through this link
https://expo.dev/accounts/fekex/projects/BookExplorer/builds/63fb8641-8a5b-4fb7-86fc-84400c0eb34d


## Tech Stack

- **React Native + Expo SDK 54** — Cross-platform mobile framework
- **TypeScript** — Type safety throughout
- **Expo Router** — File-based navigation
- **Open Library API** — Free public API, no key required
- **AsyncStorage** — Local persistence for read list
- **Axios** — HTTP client

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Expo Go app on your Android device

### Installation

```bash
git clone https://github.com/theabdulbasitt/Bookish
cd Bookish
npm install --legacy-peer-deps
npx expo start
```

Scan the QR code with Expo Go on your Android device.

---

## Project Structure

```
Bookish/
├── app/
│   ├── _layout.tsx        # Root navigation layout
│   ├── index.tsx          # Home screen
│   ├── search.tsx         # Search screen
│   ├── readlist.tsx       # Read list screen
│   └── book/[id].tsx      # Book detail screen
├── components/
│   └── ErrorMessage.tsx   # Reusable error component
├── hooks/
│   └── useBooks.ts        # Custom hooks for data fetching
├── services/
│   └── bookService.ts     # API calls and data transformation
├── types/
│   └── book.ts            # TypeScript interfaces
└── constants/
    └── colors.ts          # Color palette
```

---

## Features

- **Home Dashboard** — Two independent horizontally scrollable rows of featured books with rating badges
- **Search** — Real-time search with 500ms debouncing and 3 character minimum to prevent unnecessary API calls
- **Book Detail** — Cover image, author bio, description, star ratings and review count
- **Read List** — Mark books as read, stored locally, with remove and clear all options
- **Error Handling** — Meaningful error messages across all screens

---

## Architecture

I separated all API and state logic from UI using custom hooks. Screens only consume hooks and render UI — no business logic lives in components.

```
bookService.ts     → API calls + data transformation
useBooks.ts        → Custom hooks (state + side effects)
Screens            → UI only, consume hooks
```

I used `Promise.all` in the book detail fetch to run two API calls simultaneously, cutting load time roughly in half.

Descriptions from Open Library come with raw markdown — I built a `cleanDescription()` utility to strip all symbols, bullet points and reference links before display.

---

## API

All data comes from the [Open Library API](https://openlibrary.org/developers/api) — free with no key required.

| Endpoint | Purpose |
|---|---|
| `/search.json?q={query}` | Search + featured books |
| `/works/{id}.json` | Book description |
| `/authors/{id}.json` | Author biography |
| `covers.openlibrary.org/b/id/{id}-M.jpg` | Cover images |

---

## Known Issues

- Some books on Open Library lack ratings or publication years — handled with fallbacks
- Unit tests face a compatibility issue between jest-expo and Expo SDK 54 with React 19's new architecture. Manual testing was performed as an alternative — all flows verified on Android device

---

## Manual Testing

| Flow | Status |
|---|---|
| Home screen loads featured books | ✅ |
| Two independent scrollable rows | ✅ |
| Search returns dynamic results | ✅ |
| 3 character minimum validation | ✅ |
| Book detail loads correctly | ✅ |
| Mark as read saves to storage | ✅ |
| Read list displays saved books | ✅ |
| Remove and clear all works | ✅ |
| Error states display correctly | ✅ |
| Navigation between all screens | ✅ |

---

## Building APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Download the APK from your Expo dashboard once the build completes.