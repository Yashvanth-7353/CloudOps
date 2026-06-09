import { Link } from 'react-router-dom';
import Logo from './Logo';

const links = [
  { label: 'Docs', href: '/docs' },
  { label: 'Sign in', href: '/login' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="max-w-sm text-sm text-muted-foreground">
          Deploy to AWS and Azure from GitHub — without the DevOps overhead.
        </p>
        <div className="flex flex-wrap gap-4">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CloudOps
      </div>
    </footer>
  );
}
