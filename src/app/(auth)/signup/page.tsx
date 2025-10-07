import SignupForm from "./signup-form";

export default function SignupPage() {
    return (
        <div className="flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome
                    </h1>
                    <p className="mt-2">
                        Create your account to get started
                    </p>
                </div>
                <SignupForm />
            </div>
        </div>
    );
}
