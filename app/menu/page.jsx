'use client'

import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMenu } from '@/hooks/useMenu'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { localizedField } from '@/lib/i18n'
import Hero from '@/components/menu/Hero'
import CategoryNav from '@/components/menu/CategoryNav'
import ProductCard from '@/components/menu/ProductCard'
import ProductModal from '@/components/menu/ProductModal'
import Footer from '@/components/menu/Footer'
import WhatsappFab from '@/components/menu/WhatsappFab'

function SkeletonMenu() {
  return (
    <div className="px-4 pt-8">
      <div className="skeleton mb-4 h-7 w-40 rounded-lg" />
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 rounded-2xl bg-card p-3 shadow-card dark:bg-carddark">
            <div className="flex-1">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton mt-2 h-3 w-full rounded" />
              <div className="skeleton mt-2 h-4 w-16 rounded" />
            </div>
            <div className="skeleton h-[76px] w-[76px] shrink-0 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

function MenuContent() {
  const { settings, categories, products, loading, error } = useMenu()
  const { theme, lang, t } = useApp()
  const [activeId, setActiveId] = useState(null)
  const [selected, setSelected] = useState(null)

  const visibleCategories = useMemo(() => {
    return categories.filter((c) => products.some((p) => p.categoryId === c.id))
  }, [categories, products])

  useEffect(() => {
    if ((!activeId || !visibleCategories.some((c) => c.id === activeId)) && visibleCategories.length > 0) {
      setActiveId(visibleCategories[0].id)
    }
  }, [visibleCategories, activeId])

  const activeCategory = useMemo(
    () => visibleCategories.find((c) => c.id === activeId) || null,
    [visibleCategories, activeId]
  )

  const activeProducts = useMemo(
    () =>
      products
        .filter((p) => p.categoryId === activeId)
        .sort((a, b) => (a.sort || 0) - (b.sort || 0)),
    [products, activeId]
  )

  const selectedEmoji = useMemo(() => {
    if (!selected) return '☕'
    return categories.find((c) => c.id === selected.categoryId)?.emoji || '☕'
  }, [selected, categories])

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <main className="mx-auto min-h-screen max-w-2xl bg-paper text-ink transition-colors duration-300 dark:bg-paperdark dark:text-paper">
        <Hero settings={settings} />

        {!loading && visibleCategories.length > 0 && (
          <CategoryNav categories={visibleCategories} activeId={activeId} onSelect={setActiveId} />
        )}

        {error ? (
          <div className="px-6 py-20 text-center">
            <p className="text-4xl">😕</p>
            <p className="mt-3 font-lato text-muted dark:text-muteddark">{t('loadError')}</p>
          </div>
        ) : loading ? (
          <SkeletonMenu />
        ) : (
          <AnimatePresence mode="wait">
            <motion.section
              key={activeId}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="px-4 pb-6 pt-6"
            >
              {activeCategory && (
                <div className="mb-3.5 flex items-center gap-2.5 px-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint/60 text-lg dark:bg-forest/30">
                    {activeCategory.emoji}
                  </span>
                  <h2 className="font-playfair text-[21px] font-bold text-ink dark:text-paper">
                    {localizedField(activeCategory, 'name', lang)}
                  </h2>
                  <span className="ml-auto rounded-full bg-ink/5 px-2.5 py-1 text-[11.5px] font-bold text-muted dark:bg-paper/10 dark:text-muteddark">
                    {activeProducts.length}
                  </span>
                </div>
              )}

              {activeProducts.length === 0 ? (
                <p className="py-16 text-center text-[14px] text-muted dark:text-muteddark">
                  {t('emptyCategory')}
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {activeProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      emoji={activeCategory?.emoji}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              )}
            </motion.section>
          </AnimatePresence>
        )}

        <ProductModal product={selected} emoji={selectedEmoji} onClose={() => setSelected(null)} />

        <Footer settings={settings} />
        <WhatsappFab phone={settings?.whatsapp} />
      </main>
    </div>
  )
}

export default function MenuPage() {
  return (
    <AppProvider>
      <MenuContent />
    </AppProvider>
  )
}
