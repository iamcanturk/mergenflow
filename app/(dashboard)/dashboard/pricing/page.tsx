'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  Clock, 
  DollarSign,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function PricingCalculatorPage() {
  const { t, locale } = useTranslation()
  
  // Hourly rate calculator state
  const [monthlyExpenses, setMonthlyExpenses] = useState(15000)
  const [desiredProfit, setDesiredProfit] = useState(10000)
  const [workingHoursPerWeek, setWorkingHoursPerWeek] = useState(40)
  const [billablePercentage, setBillablePercentage] = useState(60)
  const [vacationWeeks, setVacationWeeks] = useState(4)

  // Project calculator state
  const [estimatedHours, setEstimatedHours] = useState(40)
  const [hourlyRate, setHourlyRate] = useState(500)
  const [contingencyPercent, setContingencyPercent] = useState(20)
  const [expensesCost, setExpensesCost] = useState(0)

  // Calculate suggested hourly rate
  const hourlyRateCalculation = useMemo(() => {
    const annualExpenses = monthlyExpenses * 12
    const annualDesiredIncome = (monthlyExpenses + desiredProfit) * 12
    const workingWeeks = 52 - vacationWeeks
    const totalWorkingHours = workingHoursPerWeek * workingWeeks
    const billableHours = totalWorkingHours * (billablePercentage / 100)
    
    const minimumRate = Math.ceil(annualExpenses / billableHours)
    const desiredRate = Math.ceil(annualDesiredIncome / billableHours)
    const premiumRate = Math.ceil(desiredRate * 1.3)

    return {
      billableHours,
      totalWorkingHours,
      minimumRate,
      desiredRate,
      premiumRate,
      annualAtMinimum: minimumRate * billableHours,
      annualAtDesired: desiredRate * billableHours,
    }
  }, [monthlyExpenses, desiredProfit, workingHoursPerWeek, billablePercentage, vacationWeeks])

  // Calculate project price
  const projectCalculation = useMemo(() => {
    const basePrice = estimatedHours * hourlyRate
    const contingency = basePrice * (contingencyPercent / 100)
    const totalPrice = basePrice + contingency + expensesCost
    
    return {
      basePrice,
      contingency,
      totalPrice,
      pricePerHour: totalPrice / estimatedHours,
    }
  }, [estimatedHours, hourlyRate, contingencyPercent, expensesCost])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          {t('pricing.calculator')}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'tr' ? 'Saatlik ücret ve proje fiyatı hesaplayın' : 'Calculate hourly rate and project pricing'}
        </p>
      </div>

      <Tabs defaultValue="hourly" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-[400px]">
          <TabsTrigger value="hourly" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('pricing.hourlyRate')}
          </TabsTrigger>
          <TabsTrigger value="project" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {t('pricing.projectRate')}
          </TabsTrigger>
        </TabsList>

        {/* Hourly Rate Calculator */}
        <TabsContent value="hourly" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>{locale === 'tr' ? 'Finansal Bilgiler' : 'Financial Information'}</CardTitle>
                <CardDescription>
                  {locale === 'tr' ? 'Aylık gider ve hedef gelirinizi girin' : 'Enter your monthly expenses and target income'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>{locale === 'tr' ? 'Aylık Giderler' : 'Monthly Expenses'}</Label>
                    <span className="text-sm font-medium">{formatCurrency(monthlyExpenses)}</span>
                  </div>
                  <Slider
                    value={[monthlyExpenses]}
                    onValueChange={([v]) => setMonthlyExpenses(v)}
                    min={5000}
                    max={100000}
                    step={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {locale === 'tr' ? 'Kira, faturalar, sigorta, vergi vb.' : 'Rent, bills, insurance, taxes, etc.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>{locale === 'tr' ? 'Aylık Hedef Kar' : 'Monthly Target Profit'}</Label>
                    <span className="text-sm font-medium">{formatCurrency(desiredProfit)}</span>
                  </div>
                  <Slider
                    value={[desiredProfit]}
                    onValueChange={([v]) => setDesiredProfit(v)}
                    min={0}
                    max={100000}
                    step={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {locale === 'tr' ? 'Birikim, yatırım, ekstra harcama' : 'Savings, investments, extra spending'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>{locale === 'tr' ? 'Haftalık Çalışma Saati' : 'Working Hours/Week'}</Label>
                    <span className="text-sm font-medium">{workingHoursPerWeek} {locale === 'tr' ? 'saat' : 'hours'}</span>
                  </div>
                  <Slider
                    value={[workingHoursPerWeek]}
                    onValueChange={([v]) => setWorkingHoursPerWeek(v)}
                    min={10}
                    max={60}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>{locale === 'tr' ? 'Faturalanabilir Oran' : 'Billable Percentage'}</Label>
                    <span className="text-sm font-medium">%{billablePercentage}</span>
                  </div>
                  <Slider
                    value={[billablePercentage]}
                    onValueChange={([v]) => setBillablePercentage(v)}
                    min={30}
                    max={90}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    {locale === 'tr' ? 'Toplantı, pazarlama, admin işleri düşüldüğünde' : 'After meetings, marketing, admin work'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>{locale === 'tr' ? 'Yıllık İzin' : 'Vacation Weeks'}</Label>
                    <span className="text-sm font-medium">{vacationWeeks} {locale === 'tr' ? 'hafta' : 'weeks'}</span>
                  </div>
                  <Slider
                    value={[vacationWeeks]}
                    onValueChange={([v]) => setVacationWeeks(v)}
                    min={0}
                    max={12}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    {t('pricing.suggestedRate')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    key={hourlyRateCalculation.desiredRate}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-center py-4"
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      {locale === 'tr' ? 'Önerilen Saatlik Ücret' : 'Recommended Hourly Rate'}
                    </p>
                    <p className="text-5xl font-bold text-primary">
                      {formatCurrency(hourlyRateCalculation.desiredRate)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">/saat</p>
                  </motion.div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950">
                      <p className="text-xs text-muted-foreground">{locale === 'tr' ? 'Minimum' : 'Minimum'}</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(hourlyRateCalculation.minimumRate)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                      <p className="text-xs text-muted-foreground">{locale === 'tr' ? 'Hedef' : 'Target'}</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(hourlyRateCalculation.desiredRate)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <p className="text-xs text-muted-foreground">{locale === 'tr' ? 'Premium' : 'Premium'}</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(hourlyRateCalculation.premiumRate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{locale === 'tr' ? 'Yıllık Tahmin' : 'Annual Projection'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                    <span>{locale === 'tr' ? 'Faturalanabilir Saat' : 'Billable Hours'}</span>
                    <span className="font-bold">{Math.round(hourlyRateCalculation.billableHours)} {locale === 'tr' ? 'saat/yıl' : 'hrs/year'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                    <span>{locale === 'tr' ? 'Minimum Ücretle Yıllık' : 'Annual at Minimum'}</span>
                    <span className="font-bold text-red-600">{formatCurrency(hourlyRateCalculation.annualAtMinimum)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                    <span>{locale === 'tr' ? 'Hedef Ücretle Yıllık' : 'Annual at Target'}</span>
                    <span className="font-bold text-green-600">{formatCurrency(hourlyRateCalculation.annualAtDesired)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200">
                <CardContent className="py-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {locale === 'tr' 
                        ? 'Bu hesaplama tahminidir. Sektör, deneyim ve pazar koşullarına göre ayarlayın.'
                        : 'This is an estimate. Adjust based on industry, experience, and market conditions.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Project Calculator */}
        <TabsContent value="project" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>{locale === 'tr' ? 'Proje Detayları' : 'Project Details'}</CardTitle>
                <CardDescription>
                  {locale === 'tr' ? 'Tahmini süre ve ücretleri girin' : 'Enter estimated time and rates'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('pricing.estimatedHours')}</Label>
                  <Input
                    type="number"
                    value={estimatedHours}
                    onChange={e => setEstimatedHours(Number(e.target.value))}
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('pricing.hourlyRate')} (₺)</Label>
                  <Input
                    type="number"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>{locale === 'tr' ? 'Risk Payı (Contingency)' : 'Contingency'}</Label>
                    <span className="text-sm font-medium">%{contingencyPercent}</span>
                  </div>
                  <Slider
                    value={[contingencyPercent]}
                    onValueChange={([v]) => setContingencyPercent(v)}
                    min={0}
                    max={50}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    {locale === 'tr' ? 'Beklenmeyen değişiklikler için ek süre' : 'Buffer for unexpected changes'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{locale === 'tr' ? 'Ek Masraflar (Yazılım, lisans vb.)' : 'Additional Expenses'}</Label>
                  <Input
                    type="number"
                    value={expensesCost}
                    onChange={e => setExpensesCost(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    {locale === 'tr' ? 'Proje Fiyatı' : 'Project Price'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    key={projectCalculation.totalPrice}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-center py-4"
                  >
                    <p className="text-sm text-muted-foreground mb-1">
                      {locale === 'tr' ? 'Toplam Proje Ücreti' : 'Total Project Fee'}
                    </p>
                    <p className="text-5xl font-bold text-primary">
                      {formatCurrency(projectCalculation.totalPrice)}
                    </p>
                  </motion.div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                      <span>{locale === 'tr' ? 'Temel Ücret' : 'Base Price'}</span>
                      <span className="font-medium">{formatCurrency(projectCalculation.basePrice)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                      <span>{locale === 'tr' ? 'Risk Payı' : 'Contingency'} (%{contingencyPercent})</span>
                      <span className="font-medium">{formatCurrency(projectCalculation.contingency)}</span>
                    </div>
                    {expensesCost > 0 && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                        <span>{locale === 'tr' ? 'Ek Masraflar' : 'Expenses'}</span>
                        <span className="font-medium">{formatCurrency(expensesCost)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{locale === 'tr' ? 'Efektif Saatlik Ücret' : 'Effective Hourly Rate'}</span>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {formatCurrency(projectCalculation.pricePerHour)}/saat
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-4">
                  <h4 className="font-medium mb-3">{locale === 'tr' ? 'Fiyatlandırma İpuçları' : 'Pricing Tips'}</h4>
                  <ul className="space-y-2">
                    {[
                      locale === 'tr' ? 'İlk projelerde %20-30 contingency ekleyin' : 'Add 20-30% contingency for first projects',
                      locale === 'tr' ? 'Revizyon sayısını önceden belirleyin' : 'Define revision limits upfront',
                      locale === 'tr' ? 'Ödeme planını projeye yayın (%50 peşin)' : 'Spread payments (50% upfront)',
                      locale === 'tr' ? 'Acil işler için %25-50 ek ücret uygulayın' : 'Charge 25-50% rush fee for urgent work',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
