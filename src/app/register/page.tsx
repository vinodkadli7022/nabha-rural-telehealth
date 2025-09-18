"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await authClient.signUp.email({
      email: form.email,
      name: form.name,
      password: form.password,
    });
    setLoading(false);

    if (error?.code) {
      const map: Record<string, string> = {
        USER_ALREADY_EXISTS: "Email already registered",
      };
      toast.error(map[error.code] || "Registration failed");
      return;
    }

    toast.success("Account created! Please login.");
    router.push("/login?registered=true");
  };

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 py-10">
      <Card>
        <CardContent className="pt-6">
          <h1 className="text-xl font-semibold mb-4">Create account</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => setForm((s) => ({ ...s, confirm: e.target.value }))}
                required
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            Already have an account? <Link href="/login" className="text-primary">Login</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}