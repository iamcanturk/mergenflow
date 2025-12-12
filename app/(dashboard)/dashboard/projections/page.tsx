'use client'

import { useState } from 'react'
import { useFinancialProjection, useUserSettings } from '@/hooks/use-projections'
import { useUpdateUserSettings } from '@/hooks/use-recurring-items'
import { Plus, TrendingUp, Wallet, Target, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProjectionChart, RecurringItemFormDialog, RecurringItemsList, DebtAnalysisCard } from '@/components/projections'

export default function ProjectionsPage() {
  const [months, setMonths] = useState(24)
  const [formOpen, setFormOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [inflationRate, setInflationRate] = useState(25)
  const [salaryIncreaseRate, setSalaryIncreaseRate] = useState(15)
  
  const { data: projection, isLoading } = useFinancialProjection(months)
  const { data: settings } = useUserSettings()
  const updateSettings = useUpdateUserSettings()

  // Settings güncellendiğinde state'i güncelle
  if (settings && inflationRate !== settings.inflationRate) {
    setInflationRate(settings.inflationRate)
    setSalaryIncreaseRate(settings.salaryIncreaseRate)
  }

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({ inflationRate, salaryIncreaseRate })
      setSettingsOpen(false)
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  const lastProjection = projection?.projections[projection.projections.length - 1]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projeksiyon</h1>
          <p className="text-muted-foreground">
            Finansal geleceğinizi planlayın
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" />
            Ayarlar
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tekrarlayan Kalem
          </Button>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mevcut Varlık</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{(projection?.currentAssets || 0).toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              TRY cinsinden toplam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{months} Ay Sonra</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(lastProjection?.cumulative || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₺{(lastProjection?.cumulative || 0).toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Tahmini birikimli varlık
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enflasyon</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              %{settings?.inflationRate || 25}
            </div>
            <p className="text-xs text-muted-foreground">
              Yıllık gider artışı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maaş Artışı</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              %{settings?.salaryIncreaseRate || 15}
            </div>
            <p className="text-xs text-muted-foreground">
              Yıllık gelir artışı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projeksiyon Grafiği */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Birikimli Varlık Projeksiyonu</CardTitle>
              <CardDescription>
                Gelecekteki tahmini varlık durumunuz
              </CardDescription>
            </div>
            <Select value={months.toString()} onValueChange={(v) => setMonths(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Süre seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Ay</SelectItem>
                <SelectItem value="24">24 Ay</SelectItem>
                <SelectItem value="36">36 Ay</SelectItem>
                <SelectItem value="60">60 Ay (5 Yıl)</SelectItem>
                <SelectItem value="120">120 Ay (10 Yıl)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {projection?.projections && projection.projections.length > 0 ? (
            <ProjectionChart data={projection.projections} type="area" />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              {isLoading ? 'Yükleniyor...' : 'Projeksiyon için tekrarlayan gelir/gider ekleyin'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gelir/Gider Grafiği */}
      {projection?.projections && projection.projections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aylık Gelir & Gider Projeksiyonu</CardTitle>
            <CardDescription>
              Enflasyon ve maaş artışı hesaba katılmış aylık akış
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectionChart data={projection.projections} type="line" />
          </CardContent>
        </Card>
      )}

      {/* Borç Analizi */}
      <DebtAnalysisCard />

      {/* Tekrarlayan Kalemler */}
      <Card>
        <CardHeader>
          <CardTitle>Tekrarlayan Gelir & Giderler</CardTitle>
          <CardDescription>
            Maaş, kira, abonelikler gibi düzenli kalemler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecurringItemsList />
        </CardContent>
      </Card>

      <RecurringItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      {/* Ayarlar Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Projeksiyon Ayarları</DialogTitle>
            <DialogDescription>
              Enflasyon ve maaş artış oranlarını ayarlayın.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="inflation">Yıllık Enflasyon Oranı (%)</Label>
              <Input
                id="inflation"
                type="number"
                min="0"
                max="100"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Giderlerinize uygulanacak yıllık artış oranı
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary">Yıllık Maaş Artış Oranı (%)</Label>
              <Input
                id="salary"
                type="number"
                min="0"
                max="100"
                value={salaryIncreaseRate}
                onChange={(e) => setSalaryIncreaseRate(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Gelirlerinize uygulanacak yıllık artış oranı
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
