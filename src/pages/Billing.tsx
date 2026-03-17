import { useState } from 'react';
import { api } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Navigate } from 'react-router-dom';
import { Loader2, Check, Zap, ArrowRight, CreditCard, ExternalLink } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthly: '$0',
    yearly: '$0',
    label: 'Free forever',
    features: ['1 Form', '100 Submissions/mo', 'Honeypot spam protection'],
  },
  {
    id: 'starter',
    name: 'Starter',
    monthly: '$4',
    yearly: '$40',
    label: '/month',
    features: ['5 Forms', '1,000 Submissions/mo', 'Honeypot spam protection', 'Email notifications', 'Custom redirects'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: '$9',
    yearly: '$90',
    label: '/month',
    popular: true,
    features: ['25 Forms', '10,000 Submissions/mo', 'Honeypot spam protection', 'Email notifications', 'Custom redirects', 'Webhooks', 'reCAPTCHA', 'Origin whitelisting'],
  },
  {
    id: 'business',
    name: 'Business',
    monthly: '$14',
    yearly: '$140',
    label: '/month',
    features: ['Unlimited Forms', '50,000 Submissions/mo', 'Everything in Pro', 'Webhook logs', 'API access', 'Priority support'],
  },
];

export default function Billing() {
  const { currentWorkspace, isPersonal, can } = useWorkspace();
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  if (isPersonal) return <Navigate to="/" replace />;
  if (!can('manageBilling')) return <Navigate to="/" replace />;

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const { url } = await api.billing.checkout(planId, interval);
      if (url) window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create checkout session');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { url } = await api.billing.portal();
      if (url) window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No active subscription found');
    } finally {
      setPortalLoading(false);
    }
  };

  const currentPlan = currentWorkspace?.plan || 'free';
  const planOrder = ['free', 'starter', 'pro', 'business'];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-500 mt-1">
          Manage the plan for <span className="font-medium text-gray-700">{currentWorkspace?.teamName}</span>
        </p>
      </div>

      {/* Current plan info + portal */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{currentPlan}</p>
          </div>
          {currentPlan !== 'free' && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Manage Subscription
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interval toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setInterval('month')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${interval === 'month' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval('year')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${interval === 'year' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Yearly <span className="text-xs ml-1 opacity-75">Save ~17%</span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isUpgrade = planOrder.indexOf(plan.id) > planOrder.indexOf(currentPlan);
          const price = interval === 'month' ? plan.monthly : plan.yearly;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl border-2 p-6 flex flex-col ${plan.popular ? 'border-primary-500 shadow-lg' : 'border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{price}</span>
                  {plan.id !== 'free' && (
                    <span className="text-gray-500 text-sm">/{interval === 'month' ? 'mo' : 'yr'}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button disabled className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 cursor-default">
                  Current Plan
                </button>
              ) : isUpgrade ? (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Upgrade <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <button disabled className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-50 text-gray-400 cursor-default">
                  Downgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        Payments are processed securely via Stripe. You can cancel anytime.
      </p>
    </div>
  );
}
