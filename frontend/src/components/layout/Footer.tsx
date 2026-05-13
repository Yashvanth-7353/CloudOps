import { Github, Mail, Sparkles } from 'lucide-react';

const footerLinks = [
  { label: 'Docs', href: '/docs' },
  { label: 'Deployments', href: '/deployments' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Support', href: 'mailto:support@cloudops.io' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[rgba(8,12,22,0.65)] backdrop-blur-xl py-10 text-white/80">
      <div className="page-shell page-shell--wide grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">CloudOps</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            Build, deploy, and operate your cloud infrastructure with confidence.
          </h2>
          <p className="max-w-2xl text-white/70 leading-7">
            CloudOps helps teams ship faster by automating deployment pipelines, maintaining visibility, and keeping environments secure.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="flex flex-wrap gap-3">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-primary/50 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
            <p className="mb-3 font-semibold text-white">Stay updated</p>
            <p className="leading-7">
              Subscribe to updates, release notes, and best practices for modern cloud deployments.
            </p>
            <div className="mt-4 flex items-center gap-3 text-white/80">
              <Github className="w-5 h-5" />
              <Mail className="w-5 h-5" />
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
