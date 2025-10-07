import { logout } from "@/lib/actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function LogOutPage() {
    await logout();
    redirect('/login');
}
