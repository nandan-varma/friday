"use client"

import { useState, useEffect, Suspense } from "react"
import { client } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { Trash2, Shield, Clock, Monitor, Smartphone, Laptop, MapPin, Calendar, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface Session {
    id: string
    token: string
    createdAt: Date | string
    updatedAt: Date | string
    expiresAt: Date | string
    userAgent?: string | null
    ipAddress?: string | null
    userId: string
}

interface SessionsResponse {
    data: Session[]
    error: string | null
}

function SessionsSkeleton() {
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <SessionCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    )
}

// Skeleton component for session cards
function SessionCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

// Individual session card component
interface SessionCardProps {
    session: Session
    index: number
    isCurrentSession: boolean
    revoking: string | null
    onRevoke: (token: string) => void
    formatDate: (date: Date | string) => string
    detectDeviceType: (userAgent?: string | null) => { type: string; icon: any }
    getBrowserName: (userAgent?: string | null) => string
    getLocationFromIP: (ip?: string | null) => string
    isSessionExpired: (expiresAt: Date | string) => boolean
}

function SessionCard({ 
    session, 
    index, 
    isCurrentSession, 
    revoking, 
    onRevoke, 
    formatDate,
    detectDeviceType,
    getBrowserName,
    getLocationFromIP,
    isSessionExpired
}: SessionCardProps) {
    const deviceInfo = detectDeviceType(session.userAgent)
    const DeviceIcon = deviceInfo.icon
    const browserName = getBrowserName(session.userAgent)
    const isExpired = isSessionExpired(session.expiresAt)
    
    return (
        <Card className={`transition-all hover:shadow-md ${isExpired ? 'opacity-60' : ''}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">
                                    {browserName} on {deviceInfo.type === 'mobile' ? 'Mobile' : 'Desktop'}
                                </CardTitle>
                            </div>
                            <div className="flex gap-2">
                                {isCurrentSession && (
                                    <Badge variant="secondary" className="text-xs">
                                        Current
                                    </Badge>
                                )}
                                {isExpired && (
                                    <Badge variant="destructive" className="text-xs">
                                        Expired
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Created {formatDate(session.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expires {formatDate(session.expiresAt)}
                            </div>
                            {session.ipAddress && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {session.ipAddress} • {getLocationFromIP(session.ipAddress)}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRevoke(session.token)}
                        disabled={revoking === session.token || isExpired}
                        className="gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        {revoking === session.token ? "Revoking..." : "Revoke"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Session ID
                        </p>
                        <p className="text-sm font-mono bg-secondary/50 px-2 py-1 rounded border">
                            {session.id}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            User Agent
                        </p>
                        <p className="text-sm text-muted-foreground break-all">
                            {session.userAgent || 'Unknown User Agent'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function SessionsContent() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [revoking, setRevoking] = useState<string | null>(null)
    const router = useRouter()

    const loadSessions = async () => {
        try {
            setLoading(true)
            const response = await client.listSessions()
            console.log("Loaded sessions:", response)
            if ('error' in response && response.error) {
                // not logged in
                router.push('/login')
                return
            }
            setSessions('data' in response ? response.data || [] : response || [])
        } catch (error) {
            console.error("Error loading sessions:", error)
            toast({
                title: "Error",
                description: "Failed to load sessions",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSessions()
    }, [])

    const detectDeviceType = (userAgent?: string | null) => {
        if (!userAgent) return { type: 'unknown', icon: Monitor }
        if (/Mobile|iPhone|iPad|Android/i.test(userAgent)) {
            return { type: 'mobile', icon: Smartphone }
        }
        return { type: 'desktop', icon: Laptop }
    }

    const getBrowserName = (userAgent?: string | null) => {
        if (!userAgent) return 'Unknown'
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome'
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
        if (userAgent.includes('Firefox')) return 'Firefox'
        if (userAgent.includes('Edg')) return 'Edge'
        if (userAgent.includes('Brave')) return 'Brave'
        return 'Unknown'
    }

    const getLocationFromIP = (ipAddress?: string | null) => {
        if (!ipAddress) return 'Unknown Location'
        return 'Location Hidden' // Placeholder for privacy
    }

    const isSessionExpired = (expiresAt: Date | string) => {
        const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
        return expirationDate < new Date()
    }

    const getCurrentSessionToken = () => {
        // This would typically come from your auth state or cookies
        // For now, we'll assume the first session is current
        return sessions[0]?.token
    }

    const handleRevokeSession = async (token: string) => {
        try {
            setRevoking(token)
            await client.revokeSession({ token })
            setSessions(prev => prev.filter(session => session.token !== token))
            toast({
                title: "Success",
                description: "Session revoked successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to revoke session",
                variant: "destructive",
            })
        } finally {
            setRevoking(null)
        }
    }

    const handleRevokeOtherSessions = async () => {
        try {
            setRevoking("others")
            await client.revokeOtherSessions()
            await loadSessions()
            toast({
                title: "Success",
                description: "Other sessions revoked successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to revoke other sessions",
                variant: "destructive",
            })
        } finally {
            setRevoking(null)
        }
    }

    const handleRevokeAllSessions = async () => {
        try {
            setRevoking("all")
            await client.revokeSessions()
            setSessions([])
            toast({
                title: "Success",
                description: "All sessions revoked successfully",
            })

            router.push('/login') // Redirect to sign-in page after revoking all sessions
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to revoke all sessions",
                variant: "destructive",
            })
        } finally {
            setRevoking(null)
        }
    }

    const formatDate = (dateInput: Date | string) => {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) {
        return <SessionsSkeleton />
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">Active Sessions</h1>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadSessions}
                            disabled={loading}
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                    <p className="text-muted-foreground">
                        Manage your active sessions and enhance your account security
                    </p>
                </div>

                {/* Statistics */}
                {sessions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Monitor className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Total Sessions</p>
                                        <p className="text-2xl font-bold text-primary">{sessions.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Mobile</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {sessions.filter(s => detectDeviceType(s.userAgent).type === 'mobile').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Laptop className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Desktop</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {sessions.filter(s => detectDeviceType(s.userAgent).type === 'desktop').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-destructive" />
                                    <div>
                                        <p className="text-sm font-medium">Expired</p>
                                        <p className="text-2xl font-bold text-destructive">
                                            {sessions.filter(s => isSessionExpired(s.expiresAt)).length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Action Buttons */}
                {sessions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Session Management</CardTitle>
                            <CardDescription>
                                You have {sessions.length} active session{sessions.length !== 1 ? 's' : ''} • 
                                {sessions.filter(s => isSessionExpired(s.expiresAt)).length > 0 && (
                                    <span className="text-destructive ml-1">
                                        {sessions.filter(s => isSessionExpired(s.expiresAt)).length} expired
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={handleRevokeOtherSessions}
                                        disabled={revoking === "others" || sessions.length <= 1}
                                        className="gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {revoking === "others" ? "Revoking..." : `Revoke Other Sessions (${sessions.length - 1})`}
                                    </Button>
                                    
                                    <Button
                                        variant="destructive"
                                        onClick={handleRevokeAllSessions}
                                        disabled={revoking === "all"}
                                        className="gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {revoking === "all" ? "Revoking..." : `Revoke All Sessions (${sessions.length})`}
                                    </Button>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>💡 <strong>Security tip:</strong> Regularly review and revoke unused sessions to keep your account secure.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Session Cards */}
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium text-muted-foreground">No active sessions</p>
                                <p className="text-sm text-muted-foreground">You don't have any active sessions</p>
                            </CardContent>
                        </Card>
                    ) : (
                        sessions.map((session, index) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                index={index}
                                isCurrentSession={session.token === getCurrentSessionToken()}
                                revoking={revoking}
                                onRevoke={handleRevokeSession}
                                formatDate={formatDate}
                                detectDeviceType={detectDeviceType}
                                getBrowserName={getBrowserName}
                                getLocationFromIP={getLocationFromIP}
                                isSessionExpired={isSessionExpired}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default function SessionsPage() {
    return (
        <Suspense fallback={<SessionsSkeleton />}>
            <SessionsContent />
        </Suspense>
    )
}