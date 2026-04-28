"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { DashboardHeader } from "@/components/layouts/dashboard/dashboard-header"
import { PageHeader } from "@/components/layouts/dashboard/page-header"
import { Icon } from "@/components/shared/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-provider"
import { userRoleLabels, type UserRole } from "@/types/users"

import { UbahKataSandiDialog } from "./ubah-kata-sandi-dialog"

const roleVariant: Record<UserRole, "destructive" | "info" | "success" | "muted"> = {
  admin: "destructive",
  manager: "info",
  kasir: "success",
  viewer: "muted",
}

function ProfilBody() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const forced = searchParams.get("force") === "true" || user?.mustChangePassword === true

  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (forced) setDialogOpen(true)
  }, [forced])

  if (!user) {
    return null
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col divide-y divide-border">
            <div className="flex items-center justify-between gap-3 py-3 first:pt-0">
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="text-sm font-medium">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="text-sm text-muted-foreground">Nama</dt>
              <dd className="text-sm font-medium">{user.displayName}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3 last:pb-0">
              <dt className="text-sm text-muted-foreground">Role</dt>
              <dd>
                <Badge variant={roleVariant[user.role]}>{userRoleLabels[user.role]}</Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Keamanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Kata Sandi</span>
              <span className="text-xs text-muted-foreground">
                Ubah kata sandi secara berkala untuk menjaga keamanan akun Anda.
              </span>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Icon name="key" size={16} />
              Ubah Kata Sandi
            </Button>
          </div>
        </CardContent>
      </Card>

      <UbahKataSandiDialog
        open={dialogOpen}
        forced={forced}
        onOpenChange={setDialogOpen}
        onSuccess={() => setDialogOpen(false)}
      />
    </>
  )
}

export function ProfilContent() {
  return (
    <>
      <DashboardHeader title="Profil" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Profil"
          description="Lihat informasi akun Anda dan ubah kata sandi."
          showBack={false}
        />
        <Suspense fallback={null}>
          <ProfilBody />
        </Suspense>
      </div>
    </>
  )
}
