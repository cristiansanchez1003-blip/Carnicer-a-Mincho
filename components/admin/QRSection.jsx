'use client'

import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function QRSection() {
  const wrapperRef = useRef(null)

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  const menuUrl = `${siteUrl}/menu`

  function handleDownload() {
    const canvas = wrapperRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = 'qr-menu-cafe-de-pirque.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="rounded-2xl border border-linen bg-card p-5 shadow-card">
      <h2 className="font-playfair text-lg font-bold text-ink">Código QR del menú</h2>
      <p className="mt-1 text-[13px] text-muted">
        Imprime este QR y colócalo en las mesas y el mostrador. Tus clientes lo
        escanean y ven el menú al instante.
      </p>

      <div className="mt-5 flex flex-col items-center gap-4">
        <div ref={wrapperRef} className="rounded-2xl border border-linen bg-white p-5">
          <QRCodeCanvas
            value={menuUrl}
            size={220}
            bgColor="#FFFFFF"
            fgColor="#24282A"
            level="M"
            includeMargin={false}
          />
        </div>

        <p className="break-all text-center text-xs text-muted">{menuUrl}</p>

        <button
          onClick={handleDownload}
          className="rounded-full bg-ink px-6 py-3 text-[14px] font-bold text-mint shadow-nav active:scale-95"
        >
          Descargar QR en PNG
        </button>
      </div>
    </section>
  )
}
