// app/landing/components/FeatureGrid.tsx
import { FaMoneyBillWave, FaShoppingCart, FaBook } from 'react-icons/fa';

const features = [
  { icon: FaMoneyBillWave, title: 'Halal Investments', description: 'Earn monthly returns from real-world, shariah-compliant businesses.' },
  { icon: FaShoppingCart, title: 'Ethical Marketplace', description: 'Spend SHABA token on goods/services verified by our halal board.' },
  { icon: FaBook, title: 'Learning & AI Tools', description: 'Unlock knowledge, farming AI, and finance tools with SHABA.' },
];

export  function FeatureGrid() {
  return (
    <section className="py-16 bg-white dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <feature.icon className="text-3xl mb-3 text-green-600" />
            <h3 className="font-semibold text-lg">{feature.title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
