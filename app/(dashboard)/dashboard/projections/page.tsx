'use client'

import { useState } from 'react'
import { useFinancialProjection, useUserSettings } from '@/hooks/use-projections'
import { useUpdateUserSettings } from '@/hooks/use-recurring-items'
import { useTranslation } from '@/lib/i18n'
import { Plus, TrendingUp, Wallet, Target, Settings2, BarChart3, Table2 } from 'lucide-react'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectionChart, RecurringItemFormDialog, RecurringItemsList, DebtAnalysisCard } from '@/components/projections'

export default function ProjectionsPage() {
  const { t, locale } = useTranslation()
  const [months, setMonths] = useState(24)
  const [formOpen, setFormOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [inflationRate, setInflationRate] = useState(25)
  const [salaryIncreaseRate, setSalaryIncreaseRate] = useState(15)
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')
  
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: settings?.defaultCurrency || 'TRY',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('projections.title')}</h1>
          <p className="text-muted-foreground">
            {t('projections.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" />
            {t('projections.settings')}
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('projections.addRecurring')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('projections.currentAssets')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(projection?.currentAssets || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('projections.totalInCurrency').replace('{currency}', settings?.defaultCurrency || 'TRY')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('projections.afterMonths').replace('{months}', months.toString())}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(lastProjection?.cumulative || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(lastProjection?.cumulative || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('projections.estimatedCumulative')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('projections.inflation')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              %{settings?.inflationRate || 25}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('projections.annualExpenseIncrease')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('projections.salaryIncrease')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              %{settings?.salaryIncreaseRate || 15}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('projections.annualIncomeIncrease')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projection Chart with View Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('projections.cumulativeProjection')}</CardTitle>
              <CardDescription>
                {t('projections.futureAssetDescription')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'chart' | 'table')}>
                <TabsList>
                  <TabsTrigger value="chart" className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    {t('projections.chartView')}
                  </TabsTrigger>
                  <TabsTrigger value="table" className="flex items-center gap-1">
                    <Table2 className="h-4 w-4" />
                    {t('projections.tableView')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={months.toString()} onValueChange={(v) => setMonths(Number(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('projections.selectPeriod')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">{t('projections.months').replace('{count}', '12')}</SelectItem>
                  <SelectItem value="24">{t('projections.months').replace('{count}', '24')}</SelectItem>
                  <SelectItem value="36">{t('projections.months').replace('{count}', '36')}</SelectItem>
                  <SelectItem value="60">{t('projections.months').replace('{count}', '60')} ({t('projections.years').replace('{count}', '5')})</SelectItem>
                  <SelectItem value="120">{t('projections.months').replace('{count}', '120')} ({t('projections.years').replace('{count}', '10')})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {projection?.projections && projection.projections.length > 0 ? (
            viewMode === 'chart' ? (
              <ProjectionChart data={projection.projections} type="area" />
            ) : (
              <div className="overflow-auto max-h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>{t('projections.month')}</TableHead>
                      <TableHead className="text-right text-green-600">{t('projections.income')}</TableHead>
                      <TableHead className="text-right text-red-600">{t('projections.expense')}</TableHead>
                      <TableHead className="text-right">{t('projections.net')}</TableHead>
                      <TableHead className="text-right font-bold">{t('projections.cumulative')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projection.projections.map((row, index) => {
                      const net = row.income - row.expense
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {formatMonth(row.month)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(row.income)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(row.expense)}
                          </TableCell>
                          <TableCell className={`text-right ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {net >= 0 ? '+' : ''}{formatCurrency(net)}
                          </TableCell>
                          <TableCell className={`text-right font-bold ${row.cumulative >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(row.cumulative)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              {isLoading ? t('common.loading') : t('projections.noProjectionData')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Income/Expense Chart */}
      {projection?.projections && projection.projections.length > 0 && viewMode === 'chart' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('projections.monthlyIncomeExpense')}</CardTitle>
            <CardDescription>
              {t('projections.monthlyFlowDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectionChart data={projection.projections} type="line" />
          </CardContent>
        </Card>
      )}

      {/* Debt Analysis */}
      <DebtAnalysisCard />

      {/* Recurring Items */}
      <Card>
        <CardHeader>
          <CardTitle>{t('projections.recurringItems')}</CardTitle>
          <CardDescription>
            {t('projections.recurringDescription')}
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

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('projections.settingsTitle')}</DialogTitle>
            <DialogDescription>
              {t('projections.settingsDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="inflation">{t('projections.inflationLabel')}</Label>
              <Input
                id="inflation"
                type="number"
                min="0"
                max="100"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {t('projections.inflationHint')}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary">{t('projections.salaryLabel')}</Label>
              <Input
                id="salary"
                type="number"
                min="0"
                max="100"
                value={salaryIncreaseRate}
                onChange={(e) => setSalaryIncreaseRate(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {t('projections.salaryHint')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
