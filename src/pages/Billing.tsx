import { useEffect, useState } from 'react';
import { api, type UsageData, type PlanConfig } from '../lib/api';
import { Loader2, Check, Zap, ArrowRight } from 'lucide-react';

const PLAN_PRICES: Record<string, { monthly: string; label: string }> = {
  free: { monthly: '$0', label: 'Free forever' },
  starter: { monthly: '$9', label: '/month' },
  pro: { monthly: '$29', label: '/month' },
  business: { monthly: '$79', label: '/month' },
};

const PLAN_ORDER = ['free', 'starter', 'pro', 'business'];

function PlanCard({ plan, currentPlan, onUpgrade }: { plan: PlanConfig; currentPlan: string; onUpgrade: (id: string) => void }) {
  const isCurrent = plan.id === currentPlan;
  const isUpgrade = PLAN_ORDER.indexOf(plan.id) > PLAN_ORDER.indexOf(currentPlan);
  const price = PLAN_PRICES[plan.id];
  const isPro = plan.id === 'pro';

  return (
    <div className={`relative bg-white rounded-xl border-2 p-6 flex flex-col ${isPro ? 'border-primary-500 shadow-lg' : 'border-gray-200'}`}>
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          POPULAR
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{price.monthly}</span>
          <span className="text-gray-500 text-sm">{price.label}</span>
        </div>
      </div>

      <ul className="space-y-2.5 flex-1 mb-6">
        <PlanFeature label={`${plan.forms_limit === -1 ? 'Unlimited' : plan.forms_limit} Forms`} included />
        <PlanFeature label={`${plan.submissions_limit.toLocaleString()} Submissions/mo`} included />
        <PlanFeature label="Honeypot spam protection" included />
        <PlanFeature label="Custom redirects" included={plan.custom_redirects} />
        <PlanFeature label="Webhooks" included={plan.webhooks} />
        <PlanFeature label="reCAPTCHA" included={plan.recaptcha} />
        <PlanFeature label="Email notifications" included={plan.email_notifications} />
        <PlanFeature label="Origin whitelisting" included={plan.origin_whitelist} />
        <PlanFeature label="Webhook logs" included={plan.webhook_logs} />
        <PlanFeature label="API access" included={plan.api_access} />
      </ul>

      {isCurrent ? (
        <button disabled className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 cursor-default">
          Current Plan
        </button>
      ) : isUpgrade ? (
        <button
          onClick={() => onUpgrade(plan.id)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
            isPro
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          <Zap className="h-4 w-4" /> Upgrade <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button disabled className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-50 text-gray-400 cursor-default">
          Downgrade
        </button>
      )}
    </div>
  );
}

function PlanFeature({ label, included }: { label: string; included: boolean }) {
  return (
    <li className={`flex items-center gap-2 text-sm ${included ? 'text-gray-700' : 'text-gray-300'}`}>
      <Check className={`h-4 w-4 shrink-0 ${included ? 'text-green-500' : 'text-gray-200'}`} />
      {label}
    </li>
  );
}

function UsageBar({ label, current, limit, unit = '' }: { label: string; current: number; limit: number; unit?: string }) {
  const percentage = limit === -1 ? 0 : Math.min(100, Math.round((current / limit) * 100));
  const isHigh = percentage >= 80;
  const isFull = percentage >= 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-medium ${isFull ? 'text-red-600' : isHigh ? 'text-amber-600' : 'text-gray-500'}`}>
          {current.toLocaleString()}{unit} / {limit === -1 ? '∞' : limit.toLocaleString()}{unit}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFull ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-primary-500'
          }`}
          style={{ width: `${limit === -1 ? 0 : percentage}%` }}
        />
      </div>
      {isFull && (
        <p className="text-xs text-red-600 mt-1">Limit reached. Upgrade to continue receiving submissions.</p>
      )}
    </div>
  );
}

export default function Billing() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.usage().then(setUsage).finally(() => setLoading(false));
  }, []);

  const handleUpgrade = (planId: string) => {
    const checkoutUrl = import.meta.env.VITE_POLAR_CHECKOUT_URL;
    if (checkoutUrl) {
      const url = new URL(checkoutUrl);
      url.searchParams.set('plan', planId);
      if (usage?.user.id) url.searchParams.set('metadata_user_id', usage.user.id);
      if (usage?.user.email) url.searchParams.set('email', usage.user.email);
      window.open(url.toString(), '_blank');
    } else {
      alert(`Upgrade to ${planId} — checkout will be available soon via Polar.sh`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!usage) {
    return <div className="text-center py-20 text-gray-500">Failed to load usage data</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Usage</h1>
        <p className="text-gray-500 mt-1">Manage your plan and monitor usage</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900">{usage.plan.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Billing Period</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <UsageBar
            label="Forms"
            current={usage.usage.forms}
            limit={usage.usage.forms_limit}
          />
          <UsageBar
            label="Submissions this month"
            current={usage.usage.submissions_this_month}
            limit={usage.usage.submissions_limit}
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {usage.all_plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={usage.user.plan}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>
    </div>
  );
}
