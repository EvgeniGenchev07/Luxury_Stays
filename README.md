# Luxury Stays Website

Welcome to the codebase for **Luxury Stays**, a modern accommodation listing website built with performance, accessibility, and maintainability in mind. This README provides everything you need to understand, run, and extend the project.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Optimizations](#optimizations)
- [SEO Optimization](#seo-optimization)
- [Multi-Language Support](#multi-language-support)
- [Deployment](#deployment)
- [Integrations](#integrations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Lightning-fast static site generation with [Eleventy (11ty)](https://www.11ty.dev/)
- Modular EJS templating for maintainable views
- Mobile-first responsive design (custom CSS, optimized for Core Web Vitals)
- Dynamic accommodation listings
- Booking/contact forms (integrated with backend/email provider)
- Multi-language (BG/EN) support and language toggle
- SEO best practices: meta tags, structured data, sitemap, robots.txt
- Lazy-loaded images, minimal unused CSS/JS
- QR code generator for guest Wi-Fi
- Social media integration (Instagram, Facebook)
- Analytics integration (Google Analytics/Firebase)

---

## Tech Stack

- **Static Site Generator:** Eleventy (11ty)
- **Templating:** EJS
- **Styling:** Custom CSS (with possible PostCSS/SASS pipeline); Prettier for code formatting
- **JavaScript:** Vanilla ES6, async/defer scripts for performance
- **HTML:** Semantic, accessible markup
- **Deployment:** Netlify/Vercel/FTP
- **Testing:** [pagespeed.web.dev](https://pagespeed.web.dev/) and Lighthouse
- **Version Control:** Git (hosted on GitHub)

---

## Project Structure

Luxury_Stays/
├── dist/ # Production build (static output)
├── src/ # Source directory
│ ├── templates/ # EJS layouts/partials
│ ├── pages/ # Main pages (index.ejs, listings.ejs, contact.ejs, etc.)
│ ├── assets/
│ │ ├── images/ # Optimized images
│ │ ├── css/ # Main styles, optimized, split
│ │ └── js/ # All scripts (async/defer)
│ ├── seoOptimization/ # SEO meta, sitemap, robots.txt, structured data, favicon
│ ├── lang/ # BG/EN translation files
│ └── qr/ # QR code generator (guest Wi-Fi access)
├── .prettierrc # Prettier config for code style
├── .gitignore # Git ignore rules
├── package.json # Dependency manager; build/test scripts
├── README.md # You're reading it!

**Key Files:**
- `src/templates/` — Shared HTML/EJS layouts and components
- `src/pages/` — Main page templates
- `src/assets/css/` — Custom CSS, possibly split by route
- `src/assets/js/` — All scripts, loaded with async/defer
- `src/lang/` — Translation files, language switch logic
- `src/seoOptimization/` — SEO meta tags, sitemap, robots.txt, structured schema for listings
- `.prettierrc` — Code style config

---

## Installation

1. **Clone the repository**
   git clone https://github.com/[your-org]/Luxury_Stays.git
   cd Luxury_Stays
2. **Install dependencies**
npm install
3. **Build the project**
npm run build

---

## Development Workflow

- **Edit EJS templates** in `src/templates` and pages in `src/pages`.
- **Style with CSS** in `src/assets/css`.
- Use [Prettier](https://prettier.io/) for code formatting: `npx prettier --write .`
- **JavaScript** goes in `src/assets/js/`. Use async/defer; keep it modular.
- **Translations:** Update/add in `src/lang/` for BG/EN support.
- **SEO:** Update info in `src/seoOptimization/`, including meta, robots.txt, sitemap.
- **QR Generator:** Customize logic in `src/qr/` for guest Wi-Fi codes.
- **Test performance:** Use [pagespeed.web.dev](https://pagespeed.web.dev/) on `dist` output.

---

## Optimizations

- **CSS/JS splitting:** Only load what's needed per page, eliminate unused code.
- **Async/Defer Scripts:** All non-critical JS loads async/defer.
- **Image Optimization:** Serve modern formats (WebP/AVIF); lazy-load images by default.
- **Accessibility:** Semantic HTML, alt tags, ARIA where needed.
- **SEO:** Schema.org for listings, optimized meta tags, social link previews.
- **Build Automation:** Auto-run lint/prettier on commit (see package.json scripts).
- **Multi-language:** Toggle from header/footer (BG/EN). Store user choice in localStorage or cookies.
- **QR Codes:** Generate client-side for instant access; included JS utility in `src/qr/`.

---

## SEO Optimization

- **Meta tags:** Title, description, openGraph, twitter cards
- **Sitemap:** Auto-generated in `src/seoOptimization/`
- **robots.txt:** Disallow unwanted crawling
- **Schema.org:** JSON-LD for property listings
- **Favicon:** All relevant sizes

---

## Multi-Language Support

- **Structure:** Store translation JSON/YAML in `src/lang/`
- **Switch:** Toggle from navbar/footer
- **Dynamic Markup:** EJS uses selected language file for rendering
- **Add a Language:** Copy a translation file, update `src/lang/index.js` (or config), link in navbar

---

## Deployment

- **Netlify/Vercel:** Connect repo, set build command (`npm run build` or `npx eleventy`), output to `dist`
- **FTP:** Upload everything in `/dist` to your web host.
- **Custom Domain:** Update DNS and SSL in host panel.

---

## Integrations

- **Analytics:** Add Google Analytics/Firebase tracking code to template head
- **Social Media:** Link Instagram, Facebook, and OG meta in head/footer
- **Contact:** Integrate backend API or use email service (e.g., SMTP, Netlify forms)

---

## Troubleshooting

- **Build errors:** Check EJS syntax, npm install status
- **Performance issues:** Validate on [pagespeed.web.dev](https://pagespeed.web.dev/), optimize images/CSS/JS
- **Multi-language bugs:** Verify translation keys and toggle logic
- **Form not sending:** Confirm email API/SMTP settings

---

## Contributing

1. **Fork the repo**
2. **Create a feature branch:** `git checkout -b feature/new-listing`
3. **Commit changes:** `git commit -am "Add a new listing and optimize images"`
4. **Push branch:** `git push origin feature/new-listing`
5. **Open a pull request** on GitHub

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## Maintainer

- **Evgeni Genchev** | [GitHub Profile](https://github.com/zakg6)
- For bugs, open an issue or email: gevgenig@gmail.com
- [Instagram Profile](https://www.instagram.com/gevgenig)
---

## Acknowledgements

- Built with Eleventy, Gulp, Node.js, VanillaJs and love for web performance.
- Image optimization via Squoosh and responsive design lessons from Google Web.dev.
- Inspired by modern real estate and property rental platforms.

---


