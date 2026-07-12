/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Tag, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Filter, 
  Search,
  BookOpen
} from 'lucide-react';
import { AgendaEvent } from '../types';

interface AgendaManagerProps {
  events: AgendaEvent[];
  onAddEvent: (event: AgendaEvent) => void;
  onUpdateEventStatus: (id: string, status: 'pending' | 'completed' | 'canceled') => void;
  onDeleteEvent: (id: string) => void;
}

const CATEGORIES = ['Salgados', 'Doces', 'Bebidas', 'Eventos Especiais', 'Outros'];

export default function AgendaManager({ 
  events, 
  onAddEvent, 
  onUpdateEventStatus, 
  onDeleteEvent 
}: AgendaManagerProps) {
  // Form state
  const [date, setDate] = useState(() => {
    // Next Sunday default
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)); // Next Sunday
    return d.toISOString().split('T')[0];
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Salgados');
  const [responsible, setResponsible] = useState('Sabor Central');

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedResponsible, setSelectedResponsible] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventIdToDelete, setEventIdToDelete] = useState<string | null>(null);

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !responsible.trim()) return;

    const newEvent: AgendaEvent = {
      id: `event-${Date.now()}`,
      date,
      title: title.trim(),
      description: description.trim(),
      category,
      responsible: responsible.trim(),
      status: 'pending'
    };

    onAddEvent(newEvent);

    // Reset Form fields except date
    setTitle('');
    setDescription('');
    setResponsible('Sabor Central');
  };

  // Get all unique responsibles for the filter select
  const uniqueResponsibles = Array.from(
    new Set(events.map(event => event.responsible.trim()))
  ).filter(Boolean);

  // Filter events list
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'Todos' || event.category === selectedCategory;
    const matchesResponsible = selectedResponsible === 'Todos' || event.responsible === selectedResponsible;
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesResponsible && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
          Cronograma & Agenda de Planejamento
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Agende os próximos cardápios, monte cronogramas de equipe e coordene quem fará o que
        </p>
      </div>

      {/* Main Two Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Register New Planned Event */}
        <div className="lg:col-span-5 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-5 sm:p-6 h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Plus className="w-5 h-5 text-orange-500" />
              <span>Agendar Novo Planejamento</span>
            </h3>

            {/* Date Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Data Planejada</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 font-mono transition"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Título do Evento / Prato Principal
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Pastelada com Refrigerante Caçulinha"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Categoria</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Responsible Person/Group */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Responsável / Equipe realizadora</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Grupo de Jovens, Célula Betel, Ministério de Mulheres"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Descrição do Planejamento (Opcional)
              </label>
              <textarea
                placeholder="Descreva detalhes como: ingredientes necessários, quem vai doar, meta de venda..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-300 glow-button flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
              <span>Agendar no Cronograma</span>
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Timeline with Filters */}
        <div className="lg:col-span-7 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-5 sm:p-6 flex flex-col">
          
          {/* Filtering Header Section */}
          <div className="space-y-4 pb-6 border-b border-zinc-800 mb-6">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <span>Eventos Planejados</span>
            </h3>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Filter: Category */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Categoria</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer font-medium"
                >
                  <option value="Todos">Todos</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filter: Responsible */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Responsável</span>
                <select
                  value={selectedResponsible}
                  onChange={(e) => setSelectedResponsible(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer font-medium"
                >
                  <option value="Todos">Todos</option>
                  {uniqueResponsibles.map(resp => (
                    <option key={resp} value={resp}>{resp}</option>
                  ))}
                </select>
              </div>

              {/* Search text */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Buscar</span>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por texto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Planned Events Grid/List */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[520px] pr-1">
            {filteredEvents.length > 0 ? (
              filteredEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => {
                  const displayDate = event.date.split('-').reverse().join('/');
                  
                  return (
                    <div 
                      key={event.id}
                      className="bg-zinc-950/80 border border-zinc-850 hover:border-zinc-750 p-5 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition duration-300"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Category Badge */}
                          <span className="text-[10px] uppercase tracking-wide font-bold bg-zinc-900 border border-zinc-800 text-orange-400 px-2.5 py-0.5 rounded-full">
                            {event.category}
                          </span>

                          {/* Status Badge */}
                          {event.status === 'pending' && (
                            <span className="text-[10px] uppercase tracking-wide font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Pendente</span>
                            </span>
                          )}
                          {event.status === 'completed' && (
                            <span className="text-[10px] uppercase tracking-wide font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Concluído</span>
                            </span>
                          )}
                          {event.status === 'canceled' && (
                            <span className="text-[10px] uppercase tracking-wide font-bold bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Cancelado</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-white leading-snug">{event.title}</h4>
                          {event.description && (
                            <p className="text-xs text-zinc-400 mt-1.5 whitespace-pre-line leading-relaxed">{event.description}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 pt-2 border-t border-zinc-900">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Por: <strong className="text-zinc-300 font-medium">{event.responsible}</strong></span>
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Data: <strong className="text-zinc-300 font-medium">{displayDate}</strong></span>
                          </span>
                        </div>
                      </div>

                      {/* Quick Status Control Panel & Delete */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 pt-3 sm:pt-0 border-t border-zinc-900 sm:border-0 shrink-0">
                        <div className="space-y-1 text-left sm:text-right">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Alterar Status</span>
                          <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                            {/* Action: Pending */}
                            <button
                              onClick={() => onUpdateEventStatus(event.id, 'pending')}
                              className={`p-1.5 rounded transition cursor-pointer ${event.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                              title="Pendente"
                            >
                              <Clock className="w-4 h-4" />
                            </button>

                            {/* Action: Complete */}
                            <button
                              onClick={() => onUpdateEventStatus(event.id, 'completed')}
                              className={`p-1.5 rounded transition cursor-pointer ${event.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                              title="Concluído"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>

                            {/* Action: Cancel */}
                            <button
                              onClick={() => onUpdateEventStatus(event.id, 'canceled')}
                              className={`p-1.5 rounded transition cursor-pointer ${event.status === 'canceled' ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                              title="Cancelado"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Delete Event */}
                        {eventIdToDelete === event.id ? (
                          <div className="flex items-center gap-1.5 bg-zinc-900 border border-red-500/30 rounded-xl p-1 sm:mt-2 animate-fadeIn">
                            <span className="text-[10px] text-zinc-400 px-1.5 font-semibold font-sans">Excluir?</span>
                            <button
                              onClick={() => {
                                onDeleteEvent(event.id);
                                setEventIdToDelete(null);
                              }}
                              className="text-[10px] bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 rounded-lg transition cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setEventIdToDelete(null)}
                              className="text-[10px] bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold px-2 py-1 rounded-lg transition cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEventIdToDelete(event.id)}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition duration-300 sm:mt-2 cursor-pointer"
                            title="Excluir do cronograma"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-sm gap-2">
                <Calendar className="w-8 h-8 text-zinc-700" />
                <span>Nenhum evento agendado corresponde aos filtros</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
