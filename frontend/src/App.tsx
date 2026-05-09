import { Route, Routes } from "react-router-dom";

// Placeholder home until the catalog feature lands in Module 9.
// Routes are added incrementally in routes/ as feature modules ship.
function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">EcoMart</h1>
      <p className="mt-3 text-stone-600">
        Eco-friendly tableware, leaves, and paper products.
      </p>
      <p className="mt-8 text-sm text-stone-500">
        Module 1 scaffold is live. Catalog and checkout arrive in upcoming modules.
      </p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
