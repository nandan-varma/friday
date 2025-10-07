"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Google from "@/components/icons/google";
import { signUp } from "@/lib/auth-client";
import { Loader2, Eye, EyeOff } from "lucide-react";

// Skeleton component for loading state
function SignupFormSkeleton() {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
                <div className="h-6 rounded animate-pulse" />
                <div className="h-4 rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="h-4 rounded animate-pulse w-1/4" />
                    <div className="h-10 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 rounded animate-pulse w-1/4" />
                    <div className="h-10 rounded animate-pulse" />
                </div>
                <div className="h-10 rounded animate-pulse" />
                <div className="flex items-center gap-2">
                    <div className="h-px flex-1" />
                    <div className="h-4 rounded animate-pulse w-8" />
                    <div className="h-px flex-1" />
                </div>
                <div className="h-10 rounded animate-pulse" />
            </CardContent>
        </Card>
    );
}

export default function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await signUp.email({
                name,
                email,
                password
            });

            if (response.error) {
                setError(response.error.message || "Invalid email or password");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // const handleGoogleSignup = async () => {
    //     setIsGoogleLoading(true);
    //     setError("");

    //     try {
    //         const response = await signIn.social({
    //             provider: "google"
    //         });
            
    //         if (response.error) {
    //             setError(response.error.message || "Failed to sign in with Google");
    //         } else {
    //             router.push("/dashboard");
    //         }
    //     } catch (err) {
    //         setError("Failed to sign in with Google");
    //     } finally {
    //         setIsGoogleLoading(false);
    //     }
    // };

    return (
        <Card className="w-full shadow-lg border-0 backdrop-blur-xs">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
                <CardDescription>
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleEmailSignup} className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-11"
                            disabled={isLoading}
                        />
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 pr-10"
                                disabled={isLoading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                    
                    <Button 
                        type="submit" 
                        className="w-full h-11 font-medium"
                        disabled={isLoading || !email || !password}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </form>
                
                {/* <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-4 h-11 font-medium"
                        onClick={handleGoogleSignup}
                        disabled={isGoogleLoading || isLoading}
                    >
                        {isGoogleLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Google className="mr-2 h-4 w-4" />
                                Continue with Google
                            </>
                        )}
                    </Button>
                </div> */}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2 text-center text-sm">
                <p>
                    Don't have an account?{" "}
                    <a href="/signup" className="font-medium hover:underline">
                        Sign up
                    </a>
                </p>
            </CardFooter>
        </Card>
    );
}

export { SignupFormSkeleton };
