"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export const AuthHeader = () => {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
      return;
    }
    localStorage.removeItem("bearer_token");
    refetch();
    router.push("/");
  };

  const isProtected = ["/consult", "/records", "/doctor"].includes(pathname || "");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold tracking-tight">Nabha Telemedicine</Link>
        <nav className="flex items-center gap-2">
          {!isPending && session?.user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">{session.user.email}</span>
              <Button variant="ghost" asChild>
                <Link href="/consult">Consult</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/records">Records</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/doctor">Doctor</Link>
              </Button>
              <Button size="sm" onClick={handleSignOut}>Sign out</Button>
            </>
          ) : (
            <>
              {isProtected && (
                <span className="text-xs sm:text-sm text-muted-foreground">Login required</span>
              )}
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};