"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { redirect, useRouter } from "next/navigation";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            try {
                const session = await authClient.getSession();
                setUser(session.data?.user || null);
            } catch (error) {
                console.error("Failed to get session:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getSession();
    }, []);

    const handleSignOut = async () => {
        try {
            await authClient.signOut();
            setUser(null);
            router.push("/auth");
        } catch (error) {
            console.error("Failed to sign out:", error);
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
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                <button onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <span className="text-lg font-bold">F</span>
                    </div>
                    <span className="text-xl font-bold">Friday</span>
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {!user && (
                        <>
                            <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Features
                            </a>
                            <a href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                FAQ
                            </a>
                        </>
                    )}
                    {user ? (
                        <>
                            <span className="text-sm font-medium text-foreground">
                                {user.email}
                            </span>
                            <Button variant="outline" size="sm" onClick={handleSignOut}>
                                Sign out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={handleAuthNavigation}>
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
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <HugeiconsIcon icon={mobileMenuOpen ? Cancel01Icon : Menu01Icon} />
                </button>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg">
                    <div className="flex flex-col gap-4 px-6 py-4">
                        {!user && (
                            <>
                                <a
                                    href="/#features"
                                    className="text-sm font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Features
                                </a>
                                <a
                                    href="/#faq"
                                    className="text-sm font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    FAQ
                                </a>
                            </>
                        )}
                        {user ? (
                            <>
                                <div className="text-sm font-medium text-foreground">
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
                            <>
                                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                                    <Button variant="outline" size="sm" className="w-full" onClick={handleAuthNavigation}>
                                        Sign in
                                    </Button>
                                    <Button size="sm" className="w-full" onClick={handleAuthNavigation}>
                                        Get started free
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
