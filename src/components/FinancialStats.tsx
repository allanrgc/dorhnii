'use client'

import React, { useState } from 'react'
import { useBooking, useLoyalty } from '@/context/BookingContext'
import { Calendar, CheckCircle2, CreditCard, Banknote, ChevronLeft, ChevronRight, Award } from 'lucide-react'
import { Booking } from '@/types'

export default function FinancialStats() {
  const { bookings } = useBooking()
  const { clients } = useLoyalty() 

  const [currentDate, setCurrentDate] = useState(new Date())

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthYearStr = currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  const monthStr = monthYearStr.charAt(0).toUpperCase() + monthYearStr.slice(1)

  const targetMonth = currentDate.getMonth()
  const targetYear = currentDate.getFullYear()

  const monthBookings = bookings.filter((b: Booking) => {
    const d = new Date(b.date)
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear
  })

  const scheduledCount = monthBookings.filter((b: Booking) => b.sessionStatus !== 'cancelled').length
  const completedCount = monthBookings.filter((b: Booking) => b.sessionStatus === 'completed').length
  
  const onlineRevenue = monthBookings
    .filter((b: Booking) => b.sessionStatus === 'completed' && b.paymentStatus === 'paid')
    .reduce((sum, _b) => sum + 55, 0)
    
  const localRevenue = monthBookings
    .filter((b: Booking) => b.sessionStatus === 'completed' && b.paymentStatus === 'pending')
    .reduce((sum, _b) => sum + 60, 0)

  const totalRevenue = onlineRevenue + localRevenue

  const completedCardsCount = clients ? clients.filter((c: any) => c.loyaltyStamps >= 20).length : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm">
        <h2 className="text-xl font-serif text-[#4E5E50]">Resumo Financeiro</h2>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-[#78716C]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-[#1C1917] w-40 text-center">{monthStr}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-[#78716C]">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-[#4E5E50] rounded-3xl p-8 text-center text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        
        <h3 className="text-white/80 font-medium mb-2 relative z-10">Receita Total ({monthStr.split(' ')[0]})</h3>
        <p className="text-5xl lg:text-6xl font-serif relative z-10">{totalRevenue}€</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col">
          <div className="w-10 h-10 rounded-full bg-[#FBF9F5] flex items-center justify-center text-[#586B5A] mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[#1C1917] mb-1">{scheduledCount}</p>
          <p className="text-sm text-[#78716C] font-medium">Sessões Agendadas</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col">
          <div className="w-10 h-10 rounded-full bg-[#FBF9F5] flex items-center justify-center text-[#586B5A] mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[#1C1917] mb-1">{completedCount}</p>
          <p className="text-sm text-[#78716C] font-medium">Sessões Concluídas</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col">
          <div className="w-10 h-10 rounded-full bg-[#FBF9F5] flex items-center justify-center text-[#586B5A] mb-4">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[#1C1917] mb-1">{onlineRevenue}€</p>
          <p className="text-sm text-[#78716C] font-medium">Receita Online</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col">
          <div className="w-10 h-10 rounded-full bg-[#FBF9F5] flex items-center justify-center text-[#586B5A] mb-4">
            <Banknote className="w-5 h-5" />
          </div>
          <p className="text-3xl font-serif text-[#1C1917] mb-1">{localRevenue}€</p>
          <p className="text-sm text-[#78716C] font-medium">Receita Presencial</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-6">
        <div className="w-14 h-14 rounded-full bg-[#FBF9F5] flex items-center justify-center text-[#8B7E6A] shrink-0">
          <Award className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-[#1C1917]">Programa de Fidelidade</h4>
          <p className="text-[#78716C]">Cartões Completados (20/20): <span className="font-bold text-[#4E5E50]">{completedCardsCount}</span></p>
        </div>
      </div>
    </div>
  )
}
