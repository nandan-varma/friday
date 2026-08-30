"use client";

import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const user = session?.user;

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/auth");
    } catch {
      // The session remains intact, so the user can safely try again.
    }
  };

  const handleAuthNavigation = () => {
    router.push("/auth");
  };

  const handleLogoClick = () => {
    if (user) {
      router.push("/app");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-border bg-background">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center border border-border bg-primary text-primary-foreground">
            <span className="text-lg font-bold">F</span>
          </div>
          <span className="text-xl font-bold">Friday</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {!user && (
            <>
              <Link
                href="/#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#faq"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
            </>
          )}
          {user ? (
            <>
              <span className="text-sm font-mono text-muted-foreground">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAuthNavigation}
              >
                Sign in
              </Button>
              <Button size="sm" onClick={handleAuthNavigation}>
                Get started free
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <HugeiconsIcon icon={mobileMenuOpen ? Cancel01Icon : Menu01Icon} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="flex flex-col gap-4 px-6 py-4">
            {!user && (
              <>
                <Link
                  href="/#features"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#faq"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
              </>
            )}
            {user ? (
              <>
                <div className="text-sm font-mono text-muted-foreground">
                  {user.email}
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAuthNavigation}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleAuthNavigation}
                >
                  Get started free
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
