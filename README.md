<p align="center">
    <img src="src/app/logo.svg" alt="Wunero Logo" width="220" />
</p>
<p align="center">Joy starts with a wish.</p>
<p align="center">
    <a href="https://github.com/XmlmXmlmX/wunero/actions">
        <img src="https://github.com/XmlmXmlmX/wunero/workflows/CI/badge.svg" alt="CI Status" />
    </a>
    <a href="https://github.com/XmlmXmlmX/wunero/issues">
        <img src="https://img.shields.io/github/issues/XmlmXmlmX/wunero" alt="Issues" />
    </a>
    <a href="https://github.com/XmlmXmlmX/wunero/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/XmlmXmlmX/wunero" alt="License" />
    </a>
    <img src="https://img.shields.io/badge/status-experimental-orange" alt="Project Status" />
</p>

---

Wunero is an open, lightweight wishlist app designed to collect, organize, and share wishes with others. The project is fully open source and welcomes contributions, extensions, and experimentation.

## ✨ Features

- 📝 **Create Multiple Wishlists** - Organize wishes into different lists for various occasions
- 🔗 **Product Integration** - Automatically extract product details from Amazon, eBay, and Idealo links
- 🎯 **Priority Levels** - Set priority levels for your wish items
- ✅ **Mark as Purchased** - Keep track of which items have been bought
- 🤝 **Share Wishlists** - Share your wishlists with friends and family via links
- 🐳 **Docker Ready** - Easy deployment with Docker and docker-compose
- 💾 **Lightweight Database** - Uses SQLite for simple, portable data storage

## 🚀 Tech Stack

- **Frontend & Backend**: [Next.js 16](https://nextjs.org/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: SQLite (via better-sqlite3)
- **Product Scraping**: Cheerio for HTML parsing
- **Deployment**: Docker containers

## 📦 Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/XmlmXmlmX/wunero.git
cd wunero
```

2. Run with docker-compose:
```bash
docker-compose up -d
```

3. Access the app at `http://localhost:3000`

The database will be persisted in a Docker volume named `wunero-data`.

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/XmlmXmlmX/wunero.git
cd wunero
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

## 🗂️ Project Structure

```
wunero/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   │   └── wishlists/
│   │   │       ├── route.ts                    # GET/POST wishlists
│   │   │       └── [id]/
│   │   │           ├── route.ts                # GET/PATCH/DELETE wishlist
│   │   │           └── items/
│   │   │               ├── route.ts            # GET/POST items
│   │   │               └── [itemId]/route.ts   # GET/PATCH/DELETE item
│   │   ├── wishlists/    # Wishlist pages
│   │   │   ├── page.tsx              # Wishlists overview
│   │   │   └── [id]/page.tsx         # Wishlist detail
│   │   └── page.tsx      # Home page
│   ├── lib/              # Utility functions
│   │   ├── db.ts         # Database initialization
│   │   └── productParser.ts  # Product URL scraping
│   └── types/            # TypeScript types
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── package.json
```

## 📚 API Documentation

### Wishlists

- `GET /api/wishlists` - Get all wishlists
- `POST /api/wishlists` - Create a new wishlist
- `GET /api/wishlists/:id` - Get a specific wishlist
- `PATCH /api/wishlists/:id` - Update a wishlist
- `DELETE /api/wishlists/:id` - Delete a wishlist

### Wishlist Items

- `GET /api/wishlists/:id/items` - Get all items in a wishlist
- `POST /api/wishlists/:id/items` - Add item to wishlist
- `GET /api/wishlists/:id/items/:itemId` - Get a specific item
- `PATCH /api/wishlists/:id/items/:itemId` - Update an item
- `DELETE /api/wishlists/:id/items/:itemId` - Delete an item

## 🛠️ Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🌐 Supported Platforms

Wunero can extract product information from:

- **Amazon** - Product title, image, and price
- **eBay** - Listing title, image, and price
- **Idealo** - Product title, image, and price
- **Generic** - Falls back to Open Graph tags for other sites

## 🤝 Contributing

Contributions are welcome! This project is fully open source and encourages:

- 🐛 Bug fixes
- ✨ New features
- 📖 Documentation improvements
- 🧪 Tests
- 💡 Ideas and suggestions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] User authentication and accounts
- [ ] Public/private wishlist visibility settings
- [ ] Image upload support
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Gift reservation system
- [ ] Multi-currency support
- [ ] More platform integrations

## 💬 Support

For issues, questions, or suggestions, please [open an issue](https://github.com/XmlmXmlmX/wunero/issues) on GitHub.

---

Made with ❤️ by the Wunero community
