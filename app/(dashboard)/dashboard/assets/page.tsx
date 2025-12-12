'use client'

import { useState } from 'react'
import { useAssetsSummary } from '@/hooks/use-assets'
import { Plus, Wallet, Building2, Coins, TrendingUp, Bitcoin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AssetsTable, AssetFormDialog } from '@/components/assets'

export default function AssetsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const { data: summary } = useAssetsSummary()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Varlıklar</h1>
          <p className="text-muted-foreground">
            Varlıklarınızı takip edin
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Varlık Ekle
        </Button>
      </div>

      {/* Özet Kartları */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TRY Varlıklar</CardTitle>
            <span className="text-xl">₺</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{(summary?.totalTRY || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Türk Lirası cinsinden varlıklar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USD Varlıklar</CardTitle>
            <span className="text-xl">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(summary?.totalUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Amerikan Doları cinsinden varlıklar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EUR Varlıklar</CardTitle>
            <span className="text-xl">€</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(summary?.totalEUR || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Euro cinsinden varlıklar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Varlık Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Tüm Varlıklar</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetsTable />
        </CardContent>
      </Card>

      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  )
}
