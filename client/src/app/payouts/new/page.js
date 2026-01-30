import { PayoutForm } from '@/components/payouts/PayoutForm';

export default function NewPayoutPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create Payout</h2>
      </div>
      <div className="py-6">
        <PayoutForm />
      </div>
    </div>
  );
}
