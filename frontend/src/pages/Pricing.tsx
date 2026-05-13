import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout';

type Plan = {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  subtitle: string;
  monthly: number;
  yearly: number;
  cta: string;
  highlighted?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'For solo developers and prototypes',
    monthly: 0,
    yearly: 0,
    cta: 'Start Free',
    features: [
      '3 active projects',
      '100 deployments per month',
      'Basic logs retention (7 days)',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'For teams shipping to production',
    monthly: 29,
    yearly: 24,
    cta: 'Upgrade to Pro',
    highlighted: true,
    features: [
      'Unlimited projects',
      '1,500 deployments per month',
      'Advanced logs retention (30 days)',
      'Slack alerts and audit events',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'For large organizations and compliance needs',
    monthly: 99,
    yearly: 89,
    cta: 'Contact Sales',
    features: [
      'Unlimited everything',
      'Dedicated deployment clusters',
      'Long-term logs retention (365 days)',
      'SSO / SAML and advanced RBAC',
      'Dedicated success manager',
    ],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const pricingCards = useMemo(
    () => plans.map((plan) => ({ ...plan, price: billing === 'monthly' ? plan.monthly : plan.yearly })),
    [billing],
  );

  return (
    <Layout showNavbar={true}>
      <main className="py-16 md:py-24 px-4 md:px-8 space-y-16">
        <section className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-text-primary"
          >
            Pricing That Scales With Your Deployments
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-5 text-lg text-text-secondary max-w-3xl mx-auto"
          >
            Start free, then upgrade as your team and traffic grow. Every plan includes secure CI/CD pipelines,
            observability, and one-click rollback.
          </motion.p>

          <div className="mt-8 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                billing === 'monthly' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/70 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                billing === 'yearly' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/70 hover:text-white'
              }`}
            >
              Yearly (save up to 18%)
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-3">
          {pricingCards.map((plan, index) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              viewport={{ once: true }}
              className={`rounded-2xl border p-6 backdrop-blur-md ${
                plan.highlighted
                  ? 'border-cyan-400/45 bg-[rgba(10,18,32,0.85)] shadow-[0_0_0_1px_rgba(34,211,238,0.15)]'
                  : 'border-white/10 bg-[rgba(10,14,24,0.72)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
                {plan.highlighted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-100">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-white/60">{plan.subtitle}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-white/55 ml-2">/ month</span>
              </div>

              <button
                type="button"
                className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? 'bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {plan.cta}
              </button>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/75">
                    <Check className="w-4 h-4 mt-0.5 text-cyan-300" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </section>

        <section className="max-w-7xl mx-auto rounded-2xl border border-white/10 bg-[rgba(10,14,24,0.72)] p-6 md:p-8">
          <h3 className="text-2xl font-semibold text-white">Feature Comparison</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm text-left">
              <thead>
                <tr className="text-white/70 border-b border-white/10">
                  <th className="py-3 pr-4">Feature</th>
                  <th className="py-3 pr-4">Starter</th>
                  <th className="py-3 pr-4">Pro</th>
                  <th className="py-3">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-4">Projects</td>
                  <td className="py-3 pr-4">3</td>
                  <td className="py-3 pr-4">Unlimited</td>
                  <td className="py-3">Unlimited</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-4">Monthly Deployments</td>
                  <td className="py-3 pr-4">100</td>
                  <td className="py-3 pr-4">1,500</td>
                  <td className="py-3">Custom</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-4">Logs Retention</td>
                  <td className="py-3 pr-4">7 days</td>
                  <td className="py-3 pr-4">30 days</td>
                  <td className="py-3">365 days</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">SAML SSO</td>
                  <td className="py-3 pr-4">-</td>
                  <td className="py-3 pr-4">-</td>
                  <td className="py-3">Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </Layout>
  );
}
