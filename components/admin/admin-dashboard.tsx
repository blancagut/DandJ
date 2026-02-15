"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Mail,
  Users,
  Shield,
  Briefcase,
  MessageSquare,
  CheckSquare,
  Bell,
  LogOut,
  Scale,
  Send,
} from "lucide-react"

import { ConsultationsTab } from "./tabs/consultations-tab"
import { ContactsTab } from "./tabs/contacts-tab"
import { PetitionsTab } from "./tabs/petitions-tab"
import { WaiversTab } from "./tabs/waivers-tab"
import { WorkVisasTab } from "./tabs/work-visas-tab"
import { ChatTab } from "./tabs/chat-tab"
import { TasksTab } from "./tabs/tasks-tab"
import { ContractsTab } from "./tabs/contracts-tab"
import { EmailTab } from "./tabs/email-tab"

interface AdminDashboardProps {
  user: User
  onSignOut: () => void
}

type TabCounts = {
  consultations: number
  contacts: number
  petitions: number
  waivers: number
  workVisas: number
  chat: number
  tasks: number
  contracts: number
}

export function AdminDashboard({ user, onSignOut }: AdminDashboardProps) {
  const [counts, setCounts] = useState<TabCounts>({
    consultations: 0,
    contacts: 0,
    petitions: 0,
    waivers: 0,
    workVisas: 0,
    chat: 0,
    tasks: 0,
    contracts: 0,
  })
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const loadCounts = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    const [c1, c2, c3, c4, c5, c6, c7, c8] = await Promise.all([
      supabase.from("consultation_requests").select("id", { count: "exact", head: true }),
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("petition_screenings").select("id", { count: "exact", head: true }),
      supabase.from("waiver_screenings").select("id", { count: "exact", head: true }),
      supabase.from("work_screenings").select("id", { count: "exact", head: true }),
      supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
      supabase.from("work_items").select("id", { count: "exact", head: true }).neq("status", "done"),
      supabase.from("h2b_contracts").select("id", { count: "exact", head: true }),
    ])
    setCounts({
      consultations: c1.count ?? 0,
      contacts: c2.count ?? 0,
      petitions: c3.count ?? 0,
      waivers: c4.count ?? 0,
      workVisas: c5.count ?? 0,
      chat: c6.count ?? 0,
      tasks: c7.count ?? 0,
      contracts: c8.count ?? 0,
    })
  }, [])

  // Load counts & subscribe in real-time for notifications
  useEffect(() => {
    loadCounts()

    const supabase = getSupabaseBrowserClient()
    const tables = [
      "consultation_requests",
      "leads",
      "petition_screenings",
      "waiver_screenings",
      "work_screenings",
      "chat_conversations",
      "h2b_contracts",
    ]

    const channel = supabase
      .channel("admin-global")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[0] }, () => {
        setUnreadNotifications((n) => n + 1)
        loadCounts()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[1] }, () => {
        setUnreadNotifications((n) => n + 1)
        loadCounts()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[2] }, () => {
        setUnreadNotifications((n) => n + 1)
        loadCounts()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[3] }, () => {
        setUnreadNotifications((n) => n + 1)
        loadCounts()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[4] }, () => {
        setUnreadNotifications((n) => n + 1)
        loadCounts()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[5] }, () => {
        setUnreadNotifications((n) => n + 1)
        loadCounts()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: tables[6] }, () => {
        setUnreadNotifications((n) => n + 1)
        loadCounts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadCounts])

  const tabs = [
    { value: "consultations", label: "Consultations", icon: FileText, count: counts.consultations },
    { value: "contacts", label: "Contacts", icon: Mail, count: counts.contacts },
    { value: "petitions", label: "Petitions", icon: Users, count: counts.petitions },
    { value: "waivers", label: "Waivers", icon: Shield, count: counts.waivers },
    { value: "work-visas", label: "Work Visas", icon: Briefcase, count: counts.workVisas },
    { value: "chat", label: "Chat", icon: MessageSquare, count: counts.chat },
    { value: "tasks", label: "Tasks", icon: CheckSquare, count: counts.tasks },
    { value: "contracts", label: "Contracts", icon: Scale, count: counts.contracts },
    { value: "email", label: "Email", icon: Send },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Super Admin</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setUnreadNotifications(0)}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <Tabs defaultValue="consultations" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {"count" in tab && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            <TabsContent value="consultations">
              <Card>
                <CardContent className="p-4">
                  <ConsultationsTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts">
              <Card>
                <CardContent className="p-4">
                  <ContactsTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="petitions">
              <Card>
                <CardContent className="p-4">
                  <PetitionsTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="waivers">
              <Card>
                <CardContent className="p-4">
                  <WaiversTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work-visas">
              <Card>
                <CardContent className="p-4">
                  <WorkVisasTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat">
              <Card>
                <CardContent className="p-4">
                  <ChatTab adminEmail={user.email || ""} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardContent className="p-4">
                  <TasksTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contracts">
              <Card>
                <CardContent className="p-4">
                  <ContractsTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardContent className="p-4">
                  <EmailTab />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
