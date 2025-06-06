import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export default async function LogOutPage() {
    auth.api.signOut(
        {
            headers: await headers()
        }
    );
    return (
        <div className="w-full flex items-center justify-center h-screen">
            Logging out... This shouldnt take long.
        </div>
    );
}
