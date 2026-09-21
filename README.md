# Gym Time ⚡️

A frictionless scheduling prototype designed to solve "cancellation chaos" and automate schedule management for gym owners and students.

## 🎯 The Core Problem & Solution
Gym owners often waste hours manually managing schedules, dealing with last-minute cancellations, and tracking class capacities across multiple channels (WhatsApp, spreadsheets). 

**Gym Time** solves this by providing a unified, automated calendar grid where:
1. **Students** can book or cancel classes with zero friction.
2. **Admins** have a pre-populated schedule to manage exceptions and easily manage the training calendar for a large number of students.

## ✨ Key Product Features
* **Role-Based Architecture:** Seamless toggle between Student (booking UI) and Admin (management UI) with distinct visual themes to reduce cognitive load.
* **Frictionless Booking:** 1-click enrollments with real-time visual capacity indicators (e.g., 3/5 spots).
* **Automated Weekly Grid:** The calendar engine auto-generates the week's standard operating hours, allowing the admin to manage by exception.
* **Friction UX on Destructive Actions:** Bulk cancel features (closing the gym for a day) include confirmation guards and the ability to restore the day, preventing accidental data loss.
* **Smart Navigation:** Date picker and weekly pagination capped at a 1-month future window to match standard gym billing/scheduling cycles.

## 🛠️ Tech Stack
* **Built with v0**
* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Library:** React
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Deployment:** Vercel

## 🚀 Getting Started

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/lexlemos/gym-time.git](https://github.com/lexlemos/gym-time.git)

```

2. **Navigate to the project directory:**
```bash
cd gym-time

```


3. **Install the dependencies:**
```bash
npm install

```


4. **Start the development server:**
```bash
npm run dev

```


5. Open [http://localhost:3000](http://localhost:3000?utm_source=gemini) in your browser to view the application.


