# Oludeniz Tours - Paragliding & Adventure Tours Website

A modern Next.js web application for Oludeniz Tours, showcasing paragliding and adventure tour services in beautiful Oludeniz, Turkey.

## Features

- 🏠 **Homepage** - Stunning hero section with featured tours
- 🪂 **Tours Page** - Comprehensive listing of all available tours including:
  - Tandem Paragliding
  - Boat Tours
  - Jeep Safari
  - Scuba Diving
  - Sunset Cruise
  - Kayaking Adventures
- 📖 **About Page** - Company story, values, team, and statistics
- 📞 **Contact Page** - Contact form and business information
- 📱 **Responsive Design** - Mobile-friendly layout
- 🎨 **Modern UI** - Built with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Runtime:** Node.js

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mrtandempilot/paraglidingtours.git
cd paraglidingtours
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
paraglidingwebapp/
├── app/
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── tours/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Footer.tsx
│   └── Navbar.tsx
├── public/
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Tours Offered

1. **Tandem Paragliding** (€75) - 30-45 minutes of flying with professional pilots
2. **Boat Tour** (€45) - Full-day exploration of the Turquoise Coast
3. **Jeep Safari** (€50) - 6-7 hours adventure through Taurus Mountains
4. **Scuba Diving** (€60) - Half-day underwater exploration
5. **Sunset Cruise** (€40) - 3-hour romantic evening sailing
6. **Kayaking Adventure** (€35) - 4-hour paddling through beautiful waters

## Customization

To customize the website:

- Update tour information in `app/tours/page.tsx`
- Modify contact details in `app/contact/page.tsx` and `components/Footer.tsx`
- Change company information in `app/about/page.tsx`
- Adjust styling in `tailwind.config.ts` and `app/globals.css`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Deploy with one click

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS
- DigitalOcean

## License

Copyright © 2024 Oludeniz Tours. All rights reserved.

## Contact

- **Location:** Oludeniz, Fethiye, Turkey
- **Email:** info@olubeniztours.com
- **Phone:** +90 XXX XXX XX XX

## Acknowledgments

Built with ❤️ using Next.js and Tailwind CSS
