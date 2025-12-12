'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useUserSettings } from '@/hooks/use-projections'
import { useUpdateUserSettings } from '@/hooks/use-recurring-items'
import { toast } from 'sonner'
import { User, Settings2, Bell, Palette } from 'lucide-react'

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
import { Skeleton } from '@/components/ui/skeleton'

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

      {/* Bildirim Ayarları (Placeholder) */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirim Ayarları
          </CardTitle>
          <CardDescription>
            Yakında: E-posta ve push bildirim tercihleri
          </CardDescription>
        </CardHeader>
      </Card>

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
