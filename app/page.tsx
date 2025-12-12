import Link from 'next/link'
import { 
  ArrowRight, 
  BarChart3, 
  Briefcase, 
  CheckCircle2, 
  CreditCard, 
  Kanban, 
  LineChart, 
  Shield, 
  Users,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Users,
    title: 'Müşteri Yönetimi',
    description: 'Tüm müşterilerinizi tek bir yerden yönetin. İletişim bilgileri, projeler ve ödemeler.',
  },
  {
    icon: Briefcase,
    title: 'Proje Takibi',
    description: 'Projelerinizi tekliften teslime kadar takip edin. Deadline\'ler ve bütçeler kontrol altında.',
  },
  {
    icon: Kanban,
    title: 'Kanban Board',
    description: 'Sürükle-bırak ile görevlerinizi organize edin. Scrum ve Kanban metodolojileri.',
  },
  {
    icon: CreditCard,
    title: 'Gelir & Gider',
    description: 'Tüm finansal işlemlerinizi kaydedin. Hakedişler, faturalar ve ödemeler.',
  },
  {
    icon: LineChart,
    title: 'Finansal Projeksiyon',
    description: '36 aya kadar finansal öngörü. Enflasyon ve gelir artışı hesaplamaları.',
  },
  {
    icon: BarChart3,
    title: 'Varlık Yönetimi',
    description: 'Nakit, altın, hisse ve kripto varlıklarınızı takip edin.',
  },
]

const benefits = [
  'Freelance işlerinizi profesyonelce yönetin',
  'Finansal hedeflerinize ne zaman ulaşacağınızı görün',
  'Müşteri ve proje verileriniz güvende',
  'Mobil uyumlu, her yerden erişim',
  'Türkçe arayüz ve TL desteği',
  'Düzenli gelir/gider takibi ile bütçe planlaması',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MergenFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Giriş Yap</Button>
            </Link>
            <Link href="/register">
              <Button>
                Ücretsiz Başla
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            <span>Verileriniz güvende, %100 gizli</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Freelance İşlerinizi
            <span className="block text-primary">Profesyonelce Yönetin</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Müşterilerinizi, projelerinizi ve finanslarınızı tek bir platformda yönetin.
            Finansal özgürlüğe giden yolu görün.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Ücretsiz Hesap Oluştur
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Demo İncele
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { label: 'Aktif Kullanıcı', value: '1,000+' },
            { label: 'Yönetilen Proje', value: '5,000+' },
            { label: 'İşlenen Tutar', value: '₺10M+' },
            { label: 'Memnuniyet', value: '%99' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Tüm İhtiyaçlarınız Tek Platformda
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Freelance çalışanlar için özel olarak tasarlanmış, güçlü ve kullanımı kolay araçlar.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
                Neden MergenFlow?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Freelance çalışanların en büyük sorunu finansal belirsizliktir. 
                MergenFlow ile gelecekte nereye gideceğinizi görün ve hedeflerinize ulaşın.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <LineChart className="mb-4 h-16 w-16 text-primary" />
                  <div className="text-4xl font-bold">36 Ay</div>
                  <div className="text-muted-foreground">Finansal Projeksiyon</div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Enflasyon ve gelir artışı hesaplamalarıyla<br />
                    geleceğinizi planlayın
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Hemen Başlayın
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Ücretsiz hesap oluşturun ve freelance kariyerinizi bir üst seviyeye taşıyın.
            Kredi kartı gerekmez.
          </p>
          <Link href="/register">
            <Button size="lg">
              Ücretsiz Hesap Oluştur
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">MergenFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 MergenFlow. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
