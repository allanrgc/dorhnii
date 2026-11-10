'use client'

import React, { useState } from 'react'
import { Calendar, Clock, TrendingUp } from 'lucide-react'
import AppointmentsList from './AppointmentsList'
import ScheduleSettings from './ScheduleSettings'
import FinancialStats from './FinancialStats'

export default function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'horarios' | 'financeiro'>('agenda')

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-6 lg:p-12 font-sans text-[#1C1917]">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl lg:text-4xl font-serif text-[#4E5E50]">Painel do Terapeuta</h1>
        </header>

        <nav className="flex space-x-6 border-b border-stone-200/80">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`pb-3 flex items-center space-x-2 transition-colors ${activeTab === 'agenda' ? 'border-b-2 border-[#586B5A] text-[#4E5E50]' : 'text-[#78716C] hover:text-[#4E5E50]'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Agenda</span>
          </button>
          <button
            onClick={() => setActiveTab('horarios')}
            className={`pb-3 flex items-center space-x-2 transition-colors ${activeTab === 'horarios' ? 'border-b-2 border-[#586B5A] text-[#4E5E50]' : 'text-[#78716C] hover:text-[#4E5E50]'}`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">Horários</span>
          </button>
          <button
            onClick={() => setActiveTab('financeiro')}
            className={`pb-3 flex items-center space-x-2 transition-colors ${activeTab === 'financeiro' ? 'border-b-2 border-[#586B5A] text-[#4E5E50]' : 'text-[#78716C] hover:text-[#4E5E50]'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Financeiro</span>
          </button>
        </nav>

        <main className="pt-4">
          {activeTab === 'agenda' && <AppointmentsList />}
          {activeTab === 'horarios' && <ScheduleSettings />}
          {activeTab === 'financeiro' && <FinancialStats />}
        </main>
      </div>
    </div>
  )
}
