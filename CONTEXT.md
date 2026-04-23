# 🧠 PROJECT CONTEXT SUMMARY — “Am I Normal” (Cursor Setup)

---

# 🧱 TECH STACK

- **Frontend:** Expo (React Native, Expo Router)
- **Backend:** Supabase (Postgres DB + Auth)
- **Analytics:** PostHog (event tracking, not fully wired yet)
- **Monetization (planned):** RevenueCat
- **Auth:** Supabase Anonymous Auth (intended; currently unreliable in app flow)

---

# 📁 CURRENT FILE STRUCTURE

## `/app`

- `_layout.tsx`
  - Initializes app
  - Calls `ensureAnonymousSession()` on load
  - Sets up navigation stack

- `index.tsx`
  - Entry screen
  - Currently asks for age + gender
  - Routes into question flow

- `question.tsx`
  - Loads random question
  - Handles category filtering / selected category
  - YES / NO buttons
  - Attempts to save response to Supabase
  - Routes to result screen

- `result.tsx`
  - Displays:
    - User’s answer
    - % of people who answered same
    - Emotional feedback line
  - Intended to fetch real response data from Supabase
  - Allows saving result

- `categories.tsx`
  - Displays all categories
  - Includes “All Categories”
  - Routes to question screen with category param

- `create.tsx`
  - Submit a new question (to `question_submissions`)

- `profile.tsx`
  - Displays saved results (partially implemented)

---

## `/lib`

- `supabase.ts`
  - Initializes Supabase client
  - Intended to use AsyncStorage for session persistence in Expo
  - Contains:
    - `supabase` client
    - `ensureAnonymousSession()` helper

---

## `/components`
- Minimal use currently
- Most UI is inline in screens

---

# 🗄️ DATABASE SCHEMA (SUPABASE)

## 1. `questions`
Stores approved live questions.

Fields:
- `id` (uuid, PK)
- `text` (string)
- `category_id` (uuid, FK → categories.id)
- `is_active` (boolean)

Relationship:
- many questions belong to one category
- one question has many responses

---

## 2. `categories`
Stores category metadata.

Fields:
- `id` (uuid, PK)
- `name` (string)
- `slug` (string, used in routing / filtering)

Relationship:
- one category has many questions

---

## 3. `responses` ✅ CORE TABLE
Tracks every user answer.

Fields:
- `id` (uuid, PK)
- `created_at`
- `user_id` (uuid, FK → auth.users.id)
- `question_id` (uuid, FK → questions.id)
- `answer` (boolean) → true = YES, false = NO

Relationship:
- many responses belong to one question
- many responses belong to one user

Important:
- app inserts were failing because `user_id` is required
- anonymous auth/session is the blocker

---

## 4. `saved_results`
Stores user-saved outcomes.

Fields:
- `id`
- `user_id`
- `question_id`
- `question_text`
- `answer`
- `result_percent`
- `category`

Relationship:
- many saved results belong to one user

---

## 5. `question_submissions`
Stores user-generated question suggestions.

Fields:
- `id`
- `question_text`
- `status` (pending / approved)

Intended use:
- later admin flow to approve and move into `questions`

---

# 🔐 AUTH SYSTEM

- Intended auth flow = **Supabase Anonymous Auth**
- Users should be created automatically on app start
- Each response must be tied to `user_id`

---

# ⚠️ CRITICAL DEPENDENCY

App depends on:

```ts
await ensureAnonymousSession();