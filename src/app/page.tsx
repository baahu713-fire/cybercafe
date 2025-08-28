import FoodMenu from '@/components/FoodMenu';
import OrderSummary from '@/components/OrderSummary';

export default function Home() {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
      <div className="md:col-span-2 lg:col-span-3">
        <FoodMenu />
      </div>
      <aside className="hidden md:block">
        <div className="sticky top-24">
          <OrderSummary />
        </div>
      </aside>
    </div>
  );
}
