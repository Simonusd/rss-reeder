# UI/UX Redesign — Apple Human Interface Guidelines

## Cel

Przeprojektuj cały interfejs aplikacji RSS Reader zgodnie z zasadami Apple Human Interface Guidelines (HIG).
Aplikacja ma wyglądać jak natywna aplikacja Apple — nowoczesna, czysta, piękna i funkcjonalna.
Wzoruj się na Apple News, Reeder 5, Unread, Safari Reader Mode i macOS Mail.

---

## Cztery zasady Apple HIG (musisz je respektować w każdym komponencie)

1. **Clarity (Czytelność)** — interfejs jest zrozumiały na pierwszy rzut oka. Tekst jest czytelny, ikony jednoznaczne, hierarchia wizualna natychmiastowo czytelna.
2. **Deference (Deferencja)** — UI schodzi na drugi plan, treść jest na pierwszym miejscu. Żadnych krzykliwych dekoracji które odwracają uwagę od artykułów.
3. **Depth (Głębia)** — warstwy, cienie, przezroczystości i animacje komunikują hierarchię i kontekst.
4. **Consistency (Spójność)** — ten sam element wygląda i zachowuje się tak samo w całej aplikacji.

---

## System Typografii

Używaj WYŁĄCZNIE tych fontów (dostępnych przez CSS):

```css
/* System font stack — identyczny z Apple SF Pro */
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
             'Helvetica Neue', Arial, sans-serif;

/* Dla Reader Mode — New York (serif, jak w Apple Books) */
font-family: 'New York', 'Georgia', 'Times New Roman', serif;
```

### Hierarchia typograficzna (użyj dokładnie tych rozmiarów)

```css
/* Large Title — nazwa sekcji/feedu */
.text-large-title { font-size: 34px; font-weight: 700; letter-spacing: -0.5px; }

/* Title 1 — tytuły artykułów w widoku pełnym */
.text-title1 { font-size: 28px; font-weight: 700; letter-spacing: -0.3px; }

/* Title 2 — nagłówki sekcji */
.text-title2 { font-size: 22px; font-weight: 700; letter-spacing: -0.2px; }

/* Title 3 — tytuły artykułów na liście */
.text-title3 { font-size: 20px; font-weight: 600; letter-spacing: -0.1px; }

/* Headline — etykiety, nazwy feedów */
.text-headline { font-size: 17px; font-weight: 600; }

/* Body — treść artykułów */
.text-body { font-size: 17px; font-weight: 400; line-height: 1.65; }

/* Callout — meta-informacje (data, czas czytania) */
.text-callout { font-size: 16px; font-weight: 400; }

/* Subheadline — opisy, streszczenia */
.text-subheadline { font-size: 15px; font-weight: 400; }

/* Footnote — tagi, małe etykiety */
.text-footnote { font-size: 13px; font-weight: 400; }

/* Caption — bardzo małe informacje */
.text-caption { font-size: 12px; font-weight: 400; letter-spacing: 0.1px; }
```

---

## System Kolorów

### Kolory semantyczne (automatycznie reagują na Light/Dark Mode)

```css
:root {
  /* Tła */
  --color-bg-primary: #FFFFFF;           /* główne tło */
  --color-bg-secondary: #F2F2F7;         /* tło drugorzędne (sidebar) */
  --color-bg-tertiary: #FFFFFF;          /* karty, widgety */
  --color-bg-grouped: #F2F2F7;           /* tło grup */

  /* Separatory */
  --color-separator: rgba(60, 60, 67, 0.12);
  --color-separator-opaque: #C6C6C8;

  /* Tekst */
  --color-label: #000000;               /* główny tekst */
  --color-label-secondary: rgba(60, 60, 67, 0.6);   /* meta-info */
  --color-label-tertiary: rgba(60, 60, 67, 0.3);    /* placeholdery */
  --color-label-quaternary: rgba(60, 60, 67, 0.18); /* bardzo subtelny */

  /* Akcenty Apple */
  --color-accent: #007AFF;              /* akcja główna — niebieski Apple */
  --color-accent-green: #34C759;        /* sukces, nowe artykuły */
  --color-accent-red: #FF3B30;          /* usunięcie, błąd */
  --color-accent-orange: #FF9500;       /* ostrzeżenie */
  --color-accent-purple: #AF52DE;       /* zakładki */
  --color-accent-teal: #5AC8FA;         /* tagi */

  /* Materiały (szkło / frosted glass) */
  --color-material-thick: rgba(242, 242, 247, 0.92);
  --color-material-regular: rgba(242, 242, 247, 0.8);
  --color-material-thin: rgba(242, 242, 247, 0.6);
  --color-material-ultra-thin: rgba(242, 242, 247, 0.4);
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #000000;
    --color-bg-secondary: #1C1C1E;
    --color-bg-tertiary: #2C2C2E;
    --color-bg-grouped: #1C1C1E;
    --color-separator: rgba(84, 84, 88, 0.65);
    --color-separator-opaque: #38383A;
    --color-label: #FFFFFF;
    --color-label-secondary: rgba(235, 235, 245, 0.6);
    --color-label-tertiary: rgba(235, 235, 245, 0.3);
    --color-label-quaternary: rgba(235, 235, 245, 0.18);
    --color-material-thick: rgba(28, 28, 30, 0.92);
    --color-material-regular: rgba(28, 28, 30, 0.8);
  }
}
```

### Dodatkowy motyw Sepia (dla Reader Mode)

```css
[data-theme="sepia"] {
  --color-bg-primary: #F5EDD6;
  --color-bg-secondary: #EDE0C4;
  --color-label: #3D2B1F;
  --color-label-secondary: rgba(61, 43, 31, 0.6);
  --color-accent: #8B5E3C;
}
```

---

## System Przestrzeni (Spacing)

Używaj WYŁĄCZNIE wielokrotności 4px:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;    /* podstawowy padding */
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## Zaokrąglenia (Border Radius)

```css
--radius-sm: 6px;     /* małe elementy (tagi) */
--radius-md: 10px;    /* karty artykułów */
--radius-lg: 14px;    /* modale, panele */
--radius-xl: 20px;    /* duże karty */
--radius-full: 9999px; /* przyciski pill, avatary */
```

---

## Cienie (Shadows)

```css
/* Subtelny — karty na liście */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);

/* Średni — dropdown, popover */
--shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);

/* Duży — modale, sheets */
--shadow-lg: 0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06);
```

---

## Animacje i Przejścia

Apple używa sprężystych, płynnych animacji — NIE prostych linear:

```css
/* Standardowe przejście Apple */
--transition-default: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);

/* Sprężyste — dla kart, list */
--transition-spring: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

/* Szybkie — dla hover state */
--transition-fast: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Zasady animacji
- Hover na kartach: delikatne uniesienie `transform: translateY(-1px)` + lekki cień
- Kliknięcie: `transform: scale(0.98)` przez 100ms
- Pojawienie się elementów: `opacity: 0 → 1` + `transform: translateY(8px) → 0`
- NIE używaj `transition: all` w produkcji — animuj konkretne właściwości

---

## Layout — Trzy Kolumny (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (260px)    │  LISTA (380px)      │  ARTYKUŁ (flex: 1)  │
│  bg: secondary      │  bg: primary        │  bg: primary        │
│                     │                     │                     │
│  [RSS Reader]  ⚙️   │  Technologia  ↕ ⋯  │  [Streść][Tłum][AI] │
│                     │  ─────────────────  │  ─────────────────  │
│  ────────────────   │  ● Tytuł art. 1    │                     │
│  🔵 Wszystkie  24   │    The Verge · 4min │  # Tytuł artykułu   │
│  ⭐ Zakładki    3   │  ─────────────────  │                     │
│  🔍 Szukaj          │  ○ Tytuł art. 2    │  Autor · 4 min      │
│                     │    Ars Tech · 2min  │  ─────────────────  │
│  ────────────────   │  ─────────────────  │                     │
│  FOLDERY            │                     │  Treść artykułu     │
│  📁 Technologia  8  │                     │  w Reader Mode...   │
│    · The Verge      │                     │                     │
│    · Ars Technica   │                     │                     │
│  📁 Biznes      3   │                     │                     │
│    · Forbes         │                     │                     │
│                     │                     │                     │
│  ────────────────   │                     │                     │
│  + Dodaj feed       │                     │                     │
└─────────────────────────────────────────────────────────────────┘
```

### Zasady layoutu
- Sidebar: `width: 260px`, tło `--color-bg-secondary`, bez twardej ramki — separator `1px solid --color-separator`
- Lista artykułów: `width: 380px`, każdy artykuł oddzielony subtelnym separatorem (nie card z cieniem)
- Artykuł: `flex: 1`, max-width: `720px` dla treści (margines auto), padding `32px 48px`
- Kolumny oddzielone `1px solid var(--color-separator)` — NIE box-shadow między kolumnami

---

## Komponenty — Szczegółowe Specyfikacje

### 1. Sidebar — element feedu

```
┌──────────────────────────────────────┐
│  🔵  The Verge                    12 │  ← aktywny (niebieskie tło 8% opacity)
│  ○   Ars Technica                  3 │  ← hover (tło 4% opacity)
│  ○   Hacker News                     │  ← brak nowych
└──────────────────────────────────────┘
```

- Wysokość elementu: `36px`
- Padding: `8px 12px`
- Favicon: `16x16px`, border-radius: `4px`
- Liczba nieprzeczytanych: badge `--color-accent`, `font-size: 12px`, min-width: `20px`
- Stan aktywny: `background: rgba(0, 122, 255, 0.08)`, tekst `--color-accent`
- Hover: `background: rgba(0, 0, 0, 0.04)`
- Border-radius elementu: `8px`

### 2. Karta artykułu na liście

```
┌──────────────────────────────────────────┐
│  The Verge  ·  2 godz. temu  ·  4 min   │  ← caption, color-label-secondary
│                                          │
│  Tytuł artykułu który może być długi    │  ← title3, font-weight: 600
│  i zajmować dwie linijki tekstu          │
│                                          │
│  Krótki opis lub pierwsze zdanie...      │  ← subheadline, 2 linie, tertiary
│                                          │
│  🔖  ⭐  ···                            │  ← akcje (tylko na hover)
└──────────────────────────────────────────┘
```

- Padding: `16px`
- Separator: `1px solid var(--color-separator)` na dole
- Nieprzeczytany: niebieski pasek `3px` po lewej stronie LUB grubszy font tytułu
- Przeczytany: tytuł `--color-label-secondary` (przyciemniony)
- Hover: tło `rgba(0,0,0,0.02)`
- Akcje (bookmark, gwiazdka): pojawiają się na hover z `opacity: 0 → 1`
- Obraz miniaturki (jeśli jest): `80x80px`, `border-radius: 8px`, float right

### 3. Pasek narzędzi AI (w widoku artykułu)

```
┌────────────────────────────────────────────────────────┐
│  [✦ Streść]  [🌍 Przetłumacz]  [💬 Zapytaj AI]  [↗ Oryginał] │
└────────────────────────────────────────────────────────┘
```

- Tło: `var(--color-material-thick)`, `backdrop-filter: blur(20px)`
- Border: `1px solid var(--color-separator)`
- Border-radius: `12px`
- Padding: `8px 16px`
- Przyciski: `height: 32px`, `border-radius: 8px`, padding `6px 12px`
- Styl przycisków: wypełnione `rgba(0,122,255,0.1)`, tekst `--color-accent`
- Hover: `rgba(0,122,255,0.15)`

### 4. Przyciski globalne

```css
/* Primary — główna akcja */
.btn-primary {
  background: var(--color-accent);
  color: white;
  font-size: 17px;
  font-weight: 600;
  height: 50px;
  border-radius: 14px;
  padding: 0 24px;
}

/* Secondary — drugorzędna akcja */
.btn-secondary {
  background: rgba(0, 122, 255, 0.1);
  color: var(--color-accent);
  font-size: 17px;
  font-weight: 600;
  height: 44px;
  border-radius: 12px;
}

/* Ghost — subtelna akcja */
.btn-ghost {
  background: transparent;
  color: var(--color-accent);
  font-size: 17px;
  font-weight: 400;
}

/* Destructive — usunięcie */
.btn-destructive {
  background: rgba(255, 59, 48, 0.1);
  color: var(--color-accent-red);
}
```

### 5. Pola input / formularze

```css
.input {
  height: 44px;                              /* min touch target */
  background: var(--color-bg-secondary);
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 17px;
  color: var(--color-label);
  transition: border-color 0.15s ease;
}

.input:focus {
  border-color: var(--color-accent);
  background: var(--color-bg-primary);
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.12);
}

.input::placeholder {
  color: var(--color-label-tertiary);
}
```

### 6. Modal / Sheet

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
}

.modal {
  background: var(--color-bg-primary);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  padding: 24px;
  max-width: 520px;
  width: 90%;
}

/* Animacja wejścia */
.modal-enter {
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.94) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
```

### 7. Badge (liczba nieprzeczytanych)

```css
.badge {
  background: var(--color-accent);
  color: white;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 8. Tag / Chip

```css
.tag {
  background: rgba(90, 200, 250, 0.15);
  color: #007AFF;
  font-size: 12px;
  font-weight: 500;
  height: 24px;
  border-radius: 6px;
  padding: 0 8px;
}
```

### 9. Toolbar górny (każdej kolumny)

```css
.toolbar {
  height: 52px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  background: var(--color-material-thick);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-separator);
  position: sticky;
  top: 0;
  z-index: 10;
}
```

---

## Reader Mode — Szczegółowe Style

Reader Mode to serce aplikacji. Musi wyglądać jak Apple Books / Safari Reader:

```css
.reader-content {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 48px 96px;
  font-family: var(--font-reader); /* New York / Georgia */
  font-size: 19px;
  line-height: 1.75;
  color: var(--color-label);
}

.reader-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 16px;
}

.reader-meta {
  font-size: 14px;
  color: var(--color-label-secondary);
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-separator);
}

.reader-content h2 {
  font-size: 24px;
  font-weight: 700;
  margin-top: 40px;
  margin-bottom: 16px;
}

.reader-content p {
  margin-bottom: 20px;
}

.reader-content img {
  width: 100%;
  border-radius: 12px;
  margin: 24px 0;
}

.reader-content a {
  color: var(--color-accent);
  text-decoration: none;
}

/* Pasek regulacji czcionki (floating) */
.reader-controls {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: var(--color-material-thick);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--color-separator);
}
```

---

## Ekran logowania / rejestracji

Wzoruj się na Apple ID login page — czysty, centralny, przestronny:

```
┌─────────────────────────────────────┐
│                                     │
│         📰                          │  ← duże logo/ikona
│      RSS Reader                     │  ← Large Title
│   Twój czytnik wiadomości           │  ← subheadline, secondary color
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Email                       │   │  ← input field
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  Hasło                    👁 │   │  ← input z toggle visibility
│  └─────────────────────────────┘   │
│                                     │
│  [        Zaloguj się         ]     │  ← primary button, pełna szerokość
│                                     │
│  Nie masz konta? Zarejestruj się    │  ← subtelny link
│                                     │
└─────────────────────────────────────┘
```

- Centered layout, max-width: `400px`
- Duże odstępy między elementami (`32px`)
- Logo/ikona: `80x80px`, SF Symbol style
- Tło: gradient `from-blue-50 to-white` (light) lub solid `--color-bg-primary` (dark)

---

## Strona ustawień

Wzoruj się na iOS Settings — grupy z separatorami, jasne etykiety:

```
┌─────────────────────────────────────────┐
│  ← Ustawienia                           │  ← navigation back
│                                         │
│  CZYTANIE                               │  ← section header (caption, uppercase)
│  ┌─────────────────────────────────┐   │
│  │  Reader Mode domyślnie    [ON]  │   │  ← toggle
│  │  ─────────────────────────────  │   │
│  │  Rozmiar czcionki          ——●  │   │  ← slider
│  │  ─────────────────────────────  │   │
│  │  Motyw              Jasny  ›    │   │  ← disclosure
│  └─────────────────────────────┘   │
│                                         │
│  DOSTAWCA AI                            │
│  ┌─────────────────────────────────┐   │
│  │  Claude (Anthropic)       ✓     │   │  ← selected
│  │  ─────────────────────────────  │   │
│  │  Klucz API        [sk-ant-...] │   │  ← secure input
│  └─────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Stany pustych widoków (Empty States)

Apple zawsze projektuje piękne empty states — NIE zostawiaj pustego miejsca:

```
┌──────────────────────────────────────┐
│                                      │
│              📡                      │  ← duża ikona (SF Symbol style, 64px)
│                                      │
│        Brak feedów                   │  ← Title 2
│                                      │
│   Dodaj pierwszy feed RSS żeby       │  ← Body, secondary color
│   zacząć czytać wiadomości           │
│                                      │
│   [+ Dodaj feed]                     │  ← primary button
│                                      │
└──────────────────────────────────────┘
```

Inne empty states:
- Brak artykułów: "Wszystko przeczytane" z ikoną ✓ i checkmark
- Brak zakładek: "Żadnych zapisanych artykułów"
- Ładowanie: skeleton placeholders (nie spinner) — szare prostokąty animowane shimmer

---

## Loading States — Skeleton

Zamiast spinnera używaj skeleton loading (jak Facebook, Apple News):

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    rgba(255,255,255,0.5) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Mobile Layout (< 768px)

Na telefonie layout przechodzi w jednokolumnowy z bottom navigation:

```
┌─────────────────────────┐
│  ← Technologia    ⋯     │  ← header
│  ─────────────────────  │
│  ● Tytuł artykułu 1     │
│    The Verge · 4 min    │
│  ─────────────────────  │
│  ○ Tytuł artykułu 2     │
│    Ars Tech · 2 min     │
│  ─────────────────────  │
│                         │
│                         │
│                         │
│ ─────────────────────── │
│  🏠      🔖      ⚙️     │  ← bottom tab bar
└─────────────────────────┘
```

- Bottom tab bar: `height: 83px` (z safe area), blur background
- Touch targets: minimum `44x44px` dla KAŻDEGO elementu interaktywnego
- Tap na artykuł → fullscreen reader (slide in z prawej)

---

## Ikonografia

- Używaj WYŁĄCZNIE ikon z biblioteki `lucide-react` (już zainstalowanej w projekcie)
- Rozmiar ikon: `16px` (małe), `20px` (standard), `24px` (duże)
- Kolor ikon: zawsze `currentColor` (dziedziczy kolor tekstu)
- NIE używaj emoji jako ikon UI — tylko w empty states i dekoracyjnie

### Mapowanie ikon:
```
Feedy:      Rss
Folder:     Folder
Artykuły:   Newspaper
Zakładki:   Bookmark
Ustawienia: Settings
Szukaj:     Search
Nowy feed:  Plus
Usuń:       Trash2
Odczytane:  CheckCircle2
AI/Streść:  Sparkles
Tłumaczenie:Languages
Chat AI:    MessageSquare
Oryginał:   ExternalLink
Odśwież:    RefreshCw
Motyw:      Sun / Moon
Zamknij:    X
Wróć:       ChevronLeft
```

---

## Checklist przed oddaniem redesignu

Przed zakończeniem sprawdź KAŻDY ekran:

- [ ] Dark mode działa poprawnie na wszystkich ekranach
- [ ] Wszystkie touch targety mają minimum 44x44px
- [ ] Animacje są płynne i sprężyste (cubic-bezier, nie linear)
- [ ] Empty states zaprojektowane dla każdego pustego widoku
- [ ] Skeleton loading zamiast spinnerów na listach
- [ ] Sidebar/lista/artykuł mają sticky toolbar z blur
- [ ] Reader Mode ma regulację czcionki i motywu (sepia/dark/light)
- [ ] Mobile layout z bottom navigation działa na 375px szerokości
- [ ] Formularze: wszystkie inputy mają `height: 44px`
- [ ] Przyciski primary mają `height: 50px` (iOS standard)
- [ ] Kolory semantyczne używają CSS variables (nie hardcoded hex)
- [ ] Separatory są subtelne (nie grube ramki)
- [ ] Cienie są delikatne (nie dramatyczne)
- [ ] Typografia przestrzega hierarchii (Large Title → Caption)
- [ ] Favicon feedów wyświetlają się przy nazwach feedów

---

## Inspiracje — aplikacje do przestudiowania

Zanim zaczniesz kodować, przeanalizuj wizualnie te aplikacje pod kątem ich UI:
- **Reeder 5** (macOS) — najlepszy RSS reader w stylu Apple
- **Apple News** (macOS/iOS) — trójkolumnowy layout, typografia
- **Unread** (iOS) — Reader Mode, typografia
- **Safari Reader Mode** — minimalizm, czytelność
- **Apple Mail** (macOS) — layout trójkolumnowy, sidebar

---

## Instrukcja dla Claude Code

Przeprojektuj CAŁY interfejs RSS Readera zgodnie z powyższą specyfikacją.

Kolejność pracy:
1. Zdefiniuj CSS variables w `globals.css` (kolory, spacing, radius, shadows, typography)
2. Przeprojektuj layout główny — 3 kolumny desktop, 1 kolumna mobile
3. Przeprojektuj Sidebar z folderami i feedami
4. Przeprojektuj listę artykułów z kartami
5. Przeprojektuj widok artykułu z Reader Mode
6. Przeprojektuj pasek narzędzi AI
7. Przeprojektuj ekran logowania i rejestracji
8. Przeprojektuj stronę ustawień
9. Dodaj skeleton loading states
10. Dodaj empty states dla wszystkich pustych widoków
11. Przetestuj dark mode
12. Przetestuj responsywność mobile

Zasada nadrzędna: **Treść jest na pierwszym miejscu. UI jest niewidoczne.**
