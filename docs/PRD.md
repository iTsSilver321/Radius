# Master PRD: Radius 3.0 (Production Launch)

## Project Name
Radius

## Version
3.0 (Production Release Candidate)

## Core Concept
A hyper-local, premium social marketplace connecting neighbors within a specific kilometer radius. Version 3.0 focuses on **Trust**, **Safety**, **Monetization**, and **Scalability**.

## 1. 🏗️ Technical Architecture (The Stack)
We are using the "Expo Managed Workflow" with strict Enterprise standards.

### 1.1 Core Framework
| Component | Technology | Version / Note |
| :--- | :--- | :--- |
| **Runtime** | React Native (Expo) | SDK 52+ |
| **Language** | TypeScript | Strict Mode: ON. No `any` types allowed. |
| **Navigation** | Expo Router v3 | File-based routing (Filesystem API). |
| **Styling** | NativeWind v4 | TailwindCSS for React Native. |
| **State Mgmt** | Zustand | Lightweight global store (User session, Theme, Cart). |
| **Backend** | Supabase | PostgreSQL + Auth + Realtime + Storage + Edge Functions. |
| **Payments** | Stripe | `monitor-stripe` (React Native Stripe SDK). |

### 1.2 Approved Library List (Bill of Materials)
- **Maps**: `react-native-maps` (Google Maps Provider) + `react-native-map-clustering`.
- **Location**: `expo-location` (Real-time tracking).
- **Camera/Media**: `expo-image-picker`, `expo-image-manipulator`.
- **Notifications**: `expo-notifications`.
- **UI Components**: `lucide-react-native`, `@expo-google-fonts/inter`.

## 2. 🛡️ Trust & Safety
To be store-compliant and safe for the public.

### 2.1 User Verification
- **Phone Verification**: SMS OTP using Supabase Auth.
- **Identity Badge**: "Verified ID" badge for users who upload ID (Future).
- **Reputation System**: Weighted ratings based on transaction value.

### 2.2 Content Moderation
- **Report System**: Users can report Items, Messages, and Profiles.
- **Automated Text Filter**: Block offensive keywords in Chat/Descriptions.
- **Image Scanning**: AWS Rekognition or similar to detect NSFW/Illegal items upon upload.

### 2.3 User Safety
- **Blocking**: Block users to prevent messaging and seeing listings.
- **Safety Tips**: Context-aware safety tips in chat (e.g., "Meet in public").

## 3. 💳 Payments & Monetization
### 3.1 Direct Payments
- **Stripe Connect**: Sellers onboard to receive payouts.
- **In-App Checkout**: Buyers pay via Credit Card/Apple Pay.
- **Escrow**: Funds held until "Item Received" confirmation.

### 3.2 Premium Features (Monetization)
- **Boost Listing**: Sellers pay to feature item at top of feed ($2.99 - $19.99 tiers).
- **Pro Badge**: Subscription for sellers (Analytics, unlimited listings).

## 4. 🗺️ Functional Requirements & UX Flow

### 4.1 Authentication (Enhanced)
- **Social Login**: Apple & Google Sign-In (Required for App Store).
- **Biometric Unlock**: FaceID/TouchID for returning users.

### 4.2 Core Navigation
- **Feed**: Smart sorting (Distance + Reputation + Boost). Debounced Search & Advanced Filters (Price, Condition, Brand).
- **Map**: "Search this area" floating button.
- **Sell**: AI-assisted listing (Scan image to suggest Title/Category/Price).
- **Inbox**: Rich media (Images, Location sharing). Read receipts.
- **Profile**: Transaction History, Saved Searches, "My Wallet" (Stripe Dashboard).

## 5. 🎨 Design System (Phase 3 Overhaul)
The UI/UX is not just a wrapper; it is a core feature. The goal is "Premium Utility"—beautiful enough to browse for fun, functional enough for power sellers.

### 5.1 Core Aesthetic: "Neon Aurora" (Glassmorphism)
-   **Philosophy**: Depth, Light, and Motion. Avoid flat design. Use layering to create hierarchy.
-   **Glassmorphism**: Heavy use of `GlassView` (Blur + Opacity) for implementation.
    -   *Use Case*: Floating Bottom Tab Bar, Modal backgrounds, Toast notifications.
-   **Gradients**: Subtle, multi-point mesh gradients for backgrounds.
    -   *Palette*: Deep Indigo (`#1e1b4b`) -> Electric Violet (`#7c3aed`) -> Teal (`#14b8a6`).
-   **Dark Mode First**: Primary design surface is Dark. Light mode is secondary.

### 5.2 Motion & Interactivity (Reanimated)
-   **Shared Element Transitions**: Seamless morphing from Feed Card to Details Screen.
-   **Scroll Parallax**: Headers scale and blur on scroll.
-   **Micro-interactions**:
    -   *Like*: Particle explosion.
    -   *Success*: Lottie confetti for payments/sold items.
-   **Haptics**: Targeted feedback for all interactive elements.

### 5.3 Typography & Components
-   **Typeface**: **Inter** (Variable).
    -   *Headings*: Tight tracking (-1px), Heavy weights (700-800).
-   **Masonry Layout**: Staggered dual-column feed (Pinterest style).
-   **Floating Navigation**: "Island" style tab bar to maximize screen real estate.

## 6. 💾 Data Architecture (Schema Updates)

### 6.1 Schema Additions (Completed)
- **Reviews**: Ratings and text reviews.
- **Reports**: Trust and safety moderation queue.
- **Orders**: Transaction ledger with Stripe correlation.
- **Notifications**: Real-time activity log.
- **Blocks**: User blocklist.

## 7. 🔮 Future Roadmap (Post-Launch)

### 7.1 AI & Intelligence
-   **Smart Price**: Suggest optimal price based on image similarity + current market in radius.
-   **Visual Search**: "Snap and find" - take a photo of a chair to find similar ones nearby.
-   **Scam Detection**: AI analysis of chat patterns to pre-emptively block scammers.

### 7.2 Community & Social
-   **Radius Groups**: "University Buy/Sell", "Neighborhood Watch", "Sneakerheads".
-   **Stories**: 24h evanescent updates for power sellers ("New drop coming tomorrow!").
-   **Events**: Garage sales or meetups map layer.

### 7.3 Advanced Seller Tools
-   **Bulk Upload**: Web portal for power sellers.
-   **Shipping Integration**: Generate QR code labels for items that can be shipped (Radius Extended).
-   **Analytics Dashboard**: Views, clicks, and conversion rates for Pro users.

## 8. 🚀 Launch Checklist
- [ ] **App Store Assets**: Screenshots, Video Preview.
- [ ] **Legal**: Terms of Service, Privacy Policy URLs.
- [ ] **Domain**: Landing page for `radius.app` (marketing).
- [ ] **Support**: In-app "Contact Us" form.