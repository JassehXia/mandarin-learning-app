# 🏮 Chat with Locals: Learn Mandarin by Living It

**Chat with Locals** is an immersive Mandarin learning application designed to bridge the gap between textbook study and real-world conversation. Navigate through authentic life scenarios in China—from ordering street food in Shanghai to checking into a boutique hotel—all powered by intelligent AI roleplay.

---

## ✨ Key Features

### 🎭 AI-Powered Roleplay
Engage in dynamic, context-aware conversations with local characters. Our AI doesn't just talk; it acts. Every character has a unique persona, from a trendy boba tea clerk to a helpful elderly local in a park.

### 📊 Precision Coaching & Mistake Analysis
After every session, receive a comprehensive breakdown of your performance:
- **Categorized Mistakes**: Immediate feedback on **Grammar**, **Word Choice**, **Spelling**, and more.
- **Natural Corrections**: See exactly how a native speaker would express your thoughts.
- **Mastery Scoring**: Track your proficiency across different real-world objectives.

### 🗺️ Immersive Learning Paths
Progress through curated stages including "A Day in the Life," "Campus Life," and special cultural events like "Chinese New Year."

### 🃏 Self-Generating Flashcards
The AI identifies high-value vocabulary from your actual conversations and suggests them as personalized flashcards for later review.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL
- **AI Core**: [OpenAI GPT-4o-mini](https://openai.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Language Utilities**: [pinyin-pro](https://github.com/zh-94/pinyin-pro)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database
- OpenAI API Key
- Clerk API Keys

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/mandarin-learning-app.git
   cd mandarin-learning-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root and add your keys:
   ```env
   DATABASE_URL="your_postgresql_url"
   OPENAI_API_KEY="your_openai_key"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_pub_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma generate
   npm run build  # This triggers the seed script in this project
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## 📜 License

This project is licensed under the MIT License.
