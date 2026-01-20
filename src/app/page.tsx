import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            🎁 Wunero
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your open, lightweight wishlist app
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
            Collect, organize, and share your wishes with others. Integrate products from Amazon, eBay, Idealo and more.
          </p>
          <Link
            href="/wishlists"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Create Wishlists</h3>
            <p className="text-gray-600">
              Organize your wishes into multiple lists for different occasions or categories.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Link Products</h3>
            <p className="text-gray-600">
              Add product links from Amazon, eBay, Idealo and automatically extract details.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Share Lists</h3>
            <p className="text-gray-600">
              Share your wishlists with friends and family so they know what you want.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
