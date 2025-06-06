import LoginForm from "./login-form";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="mt-2">
                        Sign in to your account to continue
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
