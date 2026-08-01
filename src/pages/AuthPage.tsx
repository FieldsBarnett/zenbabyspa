import { useState } from "react";
import { Link } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authClient.signIn.magicLink({
        email,
        name: name.trim() || undefined,
        callbackURL: `${import.meta.env.VITE_SITE_URL ?? window.location.origin}/account`,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send magic link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a magic link — no password needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Check your inbox for a sign-in link sent to <strong>{email}</strong>.
              </p>
              <Button variant="outline" onClick={() => setSent(false)}>
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional, for new accounts)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send magic link"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
