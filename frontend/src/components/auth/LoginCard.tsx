import React from 'react';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';
import { API_BASE_URL } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LoginCard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const userName = user?.username || user?.name || user?.login || user?.email || 'GitHub User';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to manage your deployments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated ? (
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="mt-1 font-semibold text-foreground">{userName}</p>
            </div>
          ) : (
            <Button
              variant="outline"
              className="h-11 w-full gap-2"
              onClick={() => window.location.assign(`${API_BASE_URL}/api/auth/github`)}
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            Secure OAuth — tokens encrypted in transit and at rest.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LoginCard;
