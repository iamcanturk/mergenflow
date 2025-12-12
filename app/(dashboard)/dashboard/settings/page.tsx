'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useUserSettings } from '@/hooks/use-projections'
import { useUpdateUserSettings } from '@/hooks/use-recurring-items'
import {
  useNotificationRules,
  useCreateNotificationRule,
  useDeleteNotificationRule,
  useToggleNotificationRule,
} from '@/hooks/use-notifications'
import { toast } from 'sonner'
import { User, Settings2, Bell, Palette, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'

const profileSchema = z.object({
  full_name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { data: settings } = useUserSettings()
  const updateSettings = useUpdateUserSettings()

  const [inflationRate, setInflationRate] = useState(25)
  const [salaryIncreaseRate, setSalaryIncreaseRate] = useState(15)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
    },
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const profileData = profile as { full_name: string | null } | null
      if (profileData?.full_name) {
        form.setValue('full_name', profileData.full_name)
      }

      setLoading(false)
    }

    loadProfile()
  }, [supabase, form])

  useEffect(() => {
    if (settings) {
      setInflationRate(settings.inflationRate)
      setSalaryIncreaseRate(settings.salaryIncreaseRate)
    }
  }, [settings])

  const onSubmitProfile = async (data: ProfileFormData) => {
    if (!userId) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name } as never)
        .eq('id', userId)

      if (error) throw error

      toast.success('Profil güncellendi')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Profil güncellenemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProjectionSettings = async () => {
    try {
      await updateSettings.mutateAsync({ inflationRate, salaryIncreaseRate })
      toast.success('Projeksiyon ayarları güncellendi')
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Ayarlar güncellenemedi')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">
            Hesap ve uygulama ayarlarınız
          </p>
        </div>
      </div>

      {/* Profil Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil Ayarları
          </CardTitle>
          <CardDescription>
            Hesap bilgilerinizi güncelleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Adınız Soyadınız" {...field} />
                    </FormControl>
                    <FormDescription>
                      Bu isim profilinizde ve sidebar&apos;da görünecektir.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Projeksiyon Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Projeksiyon Ayarları
          </CardTitle>
          <CardDescription>
            Finansal projeksiyon hesaplamalarında kullanılacak oranlar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
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
            <div className="space-y-2">
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
          <Button 
            onClick={handleSaveProjectionSettings} 
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </CardContent>
      </Card>

      {/* Bildirim Kuralları */}
      <NotificationRulesCard />

      {/* Tema Ayarları (Placeholder) */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema Ayarları
          </CardTitle>
          <CardDescription>
            Yakında: Koyu/Açık tema ve renk tercihleri
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

const ruleTypeLabels: Record<string, string> = {
  payment_due: 'Ödeme Vadesi',
  task_due: 'Görev Teslimi',
  project_deadline: 'Proje Deadline',
}

function NotificationRulesCard() {
  const { data: rules = [], isLoading } = useNotificationRules()
  const createRule = useCreateNotificationRule()
  const deleteRule = useDeleteNotificationRule()
  const toggleRule = useToggleNotificationRule()

  const [showForm, setShowForm] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    rule_type: 'payment_due' as 'payment_due' | 'task_due' | 'project_deadline',
    days_before: 1,
  })

  const handleCreateRule = async () => {
    if (!newRule.name) {
      toast.error('Kural adı gerekli')
      return
    }

    try {
      await createRule.mutateAsync(newRule)
      toast.success('Kural oluşturuldu')
      setNewRule({ name: '', rule_type: 'payment_due', days_before: 1 })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to create rule:', error)
      toast.error('Kural oluşturulamadı')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Bildirim Kuralları
            </CardTitle>
            <CardDescription>
              Otomatik hatırlatma bildirimleri
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kural
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Kural Adı</Label>
                <Input
                  placeholder="Ör: Ödeme Hatırlatması"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Kural Tipi</Label>
                <Select
                  value={newRule.rule_type}
                  onValueChange={(value: 'payment_due' | 'task_due' | 'project_deadline') =>
                    setNewRule({ ...newRule, rule_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment_due">Ödeme Vadesi</SelectItem>
                    <SelectItem value="task_due">Görev Teslimi</SelectItem>
                    <SelectItem value="project_deadline">Proje Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kaç Gün Önce</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={newRule.days_before}
                  onChange={(e) =>
                    setNewRule({ ...newRule, days_before: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateRule} disabled={createRule.isPending}>
                {createRule.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                İptal
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : rules.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Henüz bildirim kuralı eklenmemiş
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-4">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) =>
                      toggleRule.mutate({ id: rule.id, is_active: checked })
                    }
                  />
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ruleTypeLabels[rule.rule_type]} - {rule.days_before} gün önce
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => deleteRule.mutate(rule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
