"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, Calendar, User, MapPin, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

type SearchResult = {
  id: string
  type: "event" | "person" | "location"
  title: string
  description?: string
  date?: Date
  location?: string
}

// Mock search results - in a real app, these would come from an API
const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    type: "event",
    title: "Team Meeting",
    description: "Weekly team sync",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    location: "Conference Room A",
  },
  {
    id: "2",
    type: "person",
    title: "John Doe",
    description: "john.doe@example.com",
  },
  {
    id: "3",
    type: "location",
    title: "Conference Room A",
    description: "Building 1, Floor 2",
  },
]

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)

    // Simulate API call
    setTimeout(() => {
      const results = mockSearchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(results)
      setIsSearching(false)
    }, 500)
  }

  const filteredResults = searchResults.filter((result) => {
    if (activeTab === "all") return true
    return result.type === activeTab
  })

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />
      case "person":
        return <User className="h-4 w-4" />
      case "location":
        return <MapPin className="h-4 w-4" />
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "event") {
      router.push(`/events/${result.id}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-6">Search ( not complete - for illustrative purposes )</h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search events, people, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      {searchResults.length > 0 && (
        <div>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({searchResults.length})</TabsTrigger>
              <TabsTrigger value="event">Events ({searchResults.filter((r) => r.type === "event").length})</TabsTrigger>
              <TabsTrigger value="person">
                People ({searchResults.filter((r) => r.type === "person").length})
              </TabsTrigger>
              <TabsTrigger value="location">
                Locations ({searchResults.filter((r) => r.type === "location").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <Card
                    key={result.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline">{getResultIcon(result.type)}</Badge>
                          <div>
                            <CardTitle className="text-base">{result.title}</CardTitle>
                            {result.description && <CardDescription>{result.description}</CardDescription>}
                            {result.date && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(result.date, "PPP")}
                              </div>
                            )}
                            {result.location && (
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {result.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary">{result.type}</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
