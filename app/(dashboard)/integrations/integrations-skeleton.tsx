import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function IntegrationCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-10 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function IntegrationsPageSkeleton() {
    return (
        <div className="grid gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
                <IntegrationCardSkeleton key={i} />
            ))}
        </div>
    )
}
