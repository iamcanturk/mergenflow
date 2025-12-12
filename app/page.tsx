'use client'

import Link from 'next/link'
import { 
  ArrowRight, 
  BarChart3, 
  Briefcase, 
  CheckCircle2, 
  CreditCard, 
  Github,
  Globe,
  Kanban, 
  LineChart, 
  Shield, 
  Sparkles,
  Target,
  Timer,
  Users,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation, languageFlags, type Locale } from '@/lib/i18n'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  const { t, locale, setLocale } = useTranslation()

  const features = [
    {
      icon: Users,
      titleKey: 'landing.features.clientCRM.title',
      descKey: 'landing.features.clientCRM.description',
    },
    {
      icon: Briefcase,
      titleKey: 'landing.features.projectManagement.title',
      descKey: 'landing.features.projectManagement.description',
    },
    {
      icon: Kanban,
      titleKey: 'landing.features.kanban.title',
      descKey: 'landing.features.kanban.description',
    },
    {
      icon: CreditCard,
      titleKey: 'landing.features.financialTracking.title',
      descKey: 'landing.features.financialTracking.description',
    },
    {
      icon: LineChart,
      titleKey: 'landing.features.projections.title',
      descKey: 'landing.features.projections.description',
    },
    {
      icon: BarChart3,
      titleKey: 'landing.features.assets.title',
      descKey: 'landing.features.assets.description',
    },
    {
      icon: Timer,
      titleKey: 'landing.features.timeTracking.title',
      descKey: 'landing.features.timeTracking.description',
    },
    {
      icon: Target,
      titleKey: 'landing.features.goals.title',
      descKey: 'landing.features.goals.description',
    },
    {
      icon: Sparkles,
      titleKey: 'landing.features.notifications.title',
      descKey: 'landing.features.notifications.description',
    },
  ]

  const benefits = [
    'landing.benefits.list.professional',
    'landing.benefits.list.forecast',
    'landing.benefits.list.secure',
    'landing.benefits.list.mobile',
    'landing.benefits.list.multilang',
    'landing.benefits.list.budget',
    'landing.benefits.list.opensource',
    'landing.benefits.list.free',
  ]

  const toggleLocale = () => {
    setLocale(locale === 'tr' ? 'en' : 'tr')
  }

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
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleLocale}
              className="flex items-center gap-1.5"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{languageFlags[locale as Locale]}</span>
              <span className="text-xs uppercase">{locale}</span>
            </Button>
            
            {/* GitHub Link */}
            <Link href="https://github.com/iamcanturk/mergenflow" target="_blank">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Github className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t('landing.hero.login')}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                {t('landing.hero.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 sm:py-28 text-center">
        <motion.div 
          className="mx-auto max-w-4xl"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div 
            className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm"
            variants={fadeInUp}
          >
            <Shield className="h-4 w-4 text-primary" />
            <span>{t('landing.hero.badge')}</span>
          </motion.div>
          
          <motion.h1 
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            variants={fadeInUp}
          >
            {t('landing.hero.titleLine1')}
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('landing.hero.titleLine2')}
            </span>
          </motion.h1>
          
          <motion.p 
            className="mb-8 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            {t('landing.hero.subtitle')}
          </motion.p>
          
          <motion.div 
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={fadeInUp}
          >
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base">
                {t('landing.hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://github.com/iamcanturk/mergenflow" target="_blank">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                <Github className="mr-2 h-5 w-5" />
                {t('landing.hero.github')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {[
            { labelKey: 'landing.stats.users', value: '1,000+' },
            { labelKey: 'landing.stats.projects', value: '5,000+' },
            { labelKey: 'landing.stats.amount', value: locale === 'tr' ? '₺10M+' : '$500K+' },
            { labelKey: 'landing.stats.satisfaction', value: '99%' },
          ].map((stat) => (
            <div key={stat.labelKey} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{t(stat.labelKey)}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="border-y bg-muted/30 py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              {t('landing.features.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('landing.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground">{t(feature.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl md:text-5xl">
                {t('landing.benefits.title')}
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {t('landing.benefits.subtitle')}
              </p>
              <ul className="space-y-4">
                {benefits.map((benefitKey, index) => (
                  <motion.li 
                    key={benefitKey} 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{t(benefitKey)}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-square overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 shadow-2xl shadow-primary/10">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <LineChart className="h-10 w-10" />
                  </div>
                  <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    36 {t('landing.benefits.months')}
                  </div>
                  <div className="text-xl text-muted-foreground mt-2">
                    {t('landing.benefits.projection')}
                  </div>
                  <div className="mt-6 text-sm text-muted-foreground max-w-xs">
                    {t('landing.benefits.projectionDesc')}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="border-y bg-muted/30 py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm">
              <Github className="h-4 w-4" />
              <span>{t('landing.opensource.badge')}</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              {t('landing.opensource.title')}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {t('landing.opensource.description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://github.com/iamcanturk/mergenflow" target="_blank">
                <Button size="lg" variant="outline" className="text-base">
                  <Github className="mr-2 h-5 w-5" />
                  {t('landing.opensource.viewGithub')}
                </Button>
              </Link>
              <Link href="https://github.com/iamcanturk/mergenflow/stargazers" target="_blank">
                <Button size="lg" variant="ghost" className="text-base">
                  ⭐ {t('landing.opensource.star')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              {t('landing.cta.title')}
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              {t('landing.cta.subtitle')}
            </p>
            <Link href="/register">
              <Button size="lg" className="text-base px-8">
                {t('landing.cta.button')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {t('landing.cta.noCreditCard')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">MergenFlow</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="https://github.com/iamcanturk/mergenflow" target="_blank">
                <Button variant="ghost" size="icon">
                  <Github className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleLocale}
              >
                {languageFlags[locale as Locale]} {locale.toUpperCase()}
              </Button>
            </div>
            
            <div className="flex flex-col items-center gap-1 sm:items-end text-sm text-muted-foreground">
              <p>© 2025 MergenFlow. {t('landing.footer.rights')}</p>
              <p>
                {t('landing.footer.madeWith')}{' '}
                <a 
                  href="https://iamcanturk.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Yusuf Can TÜRK
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
