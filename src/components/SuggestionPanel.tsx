/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  QrCode, 
  ThumbsUp, 
  Check, 
  Trash2, 
  ExternalLink, 
  Sparkles,
  Utensils,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { FoodSuggestion, AgendaEvent } from '../types';

interface SuggestionPanelProps {
  suggestions: FoodSuggestion[];
  onUpvoteSuggestion: (id: string) => void;
  onApproveSuggestion: (id: string) => void;
  onDeleteSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onConvertSuggestionToEvent: (suggestion: FoodSuggestion) => void;
  onOpenCustomerView: () => void;
}

export default function SuggestionPanel({
  suggestions,
  onUpvoteSuggestion,
  onApproveSuggestion,
  onDeleteSuggestion,
  onRejectSuggestion,
  onConvertSuggestionToEvent,
  onOpenCustomerView
}: SuggestionPanelProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [suggestionIdToDelete, setSuggestionIdToDelete] = useState<string | null>(null);
  
  // Construct dynamic URL pointing to client suggestion page
  const suggestionUrl = `${window.location.origin}${window.location.pathname}#sugerir`;
  
  // Generate QR Code URL from qrserver API (highly reliable, clean white background for best scanning results)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(suggestionUrl)}`;

  // Filter suggestions
  const filteredSuggestions = suggestions.filter(sug => {
    if (filter === 'all') return true;
    return sug.status === filter;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
          Painel de Sugestões & QR Code
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Gerencie os pedidos dos fiéis e incentive a participação através do QR Code da Cantina
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: QR Code Display Card */}
        <div className="lg:col-span-5 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-5 sm:p-6 flex flex-col items-center justify-between text-center">
          <div className="w-full">
            <h3 className="text-base font-display font-bold text-white flex items-center justify-center gap-2 pb-2 border-b border-zinc-800 mb-6">
              <QrCode className="w-5 h-5 text-orange-500" />
              <span>QR Code de Sugestões</span>
            </h3>

            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
              Apresente este QR Code em um tablet na cantina ou imprima-o. Ao escanear, os fiéis são redirecionados à tela de sugestões culinárias!
            </p>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl border border-zinc-700/30 mb-6 group relative">
              <img 
                src={qrCodeUrl} 
                alt="QR Code do Sabor Central" 
                className="w-48 h-48 block rounded-md"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-350 flex items-center justify-center rounded-2xl">
                <span className="text-white text-xs font-semibold bg-orange-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Escaneável</span>
                </span>
              </div>
            </div>

            {/* URL Display */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 mb-6">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">
                Link do Portal de Sugestões
              </span>
              <a 
                href={suggestionUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-orange-400 hover:text-orange-300 font-mono underline break-all inline-flex items-center gap-1"
              >
                <span>{suggestionUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          {/* Quick client mode tester */}
          <button
            onClick={onOpenCustomerView}
            className="w-full bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 text-xs font-bold py-3 px-4 rounded-xl border border-zinc-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-orange-400 animate-bounce" />
            <span>Simular/Abrir Tela de Sugestões</span>
          </button>
        </div>

        {/* Right Column: Central Admin List of Suggestions */}
        <div className="lg:col-span-7 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-5 sm:p-6 flex flex-col">
          
          {/* Header and filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              <span>Inbox de Sugestões ({suggestions.length})</span>
            </h3>

            {/* Filters */}
            <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${filter === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${filter === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Aprovadas
              </button>
            </div>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[480px] pr-1">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((sug) => {
                  const displayDate = new Date(sug.date).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                    <div 
                      key={sug.id}
                      className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition duration-300 hover:border-zinc-750"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{sug.foodName}</span>
                          
                          {/* Small Status badge */}
                          {sug.status === 'approved' && (
                            <span className="text-[9px] uppercase tracking-wide font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                              Aprovada
                            </span>
                          )}
                          {sug.status === 'rejected' && (
                            <span className="text-[9px] uppercase tracking-wide font-extrabold bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded">
                              Recusada
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                          <span>Sugerido por: <strong className="text-zinc-300 font-medium">{sug.submittedBy}</strong></span>
                          <span>•</span>
                          <span className="font-mono">{displayDate}</span>
                        </div>

                        {/* If approved, offer to convert to planned action */}
                        {sug.status === 'approved' && (
                          <button
                            onClick={() => onConvertSuggestionToEvent(sug)}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 hover:underline bg-orange-500/5 border border-orange-500/10 hover:border-orange-500/25 px-2.5 py-1.5 rounded-lg transition font-semibold cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Transformar em Planejamento</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Controls (Upvotes, Status Toggle, Trash) */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0 pt-3 sm:pt-0 border-t border-zinc-900 sm:border-0">
                        
                        {/* Upvotes display and click */}
                        <button
                          onClick={() => onUpvoteSuggestion(sug.id)}
                          className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-750 transition cursor-pointer group"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-orange-500 group-hover:scale-115 transition-transform" />
                          <span>{sug.upvotes}</span>
                        </button>

                        {/* Status/Trash Controls */}
                        <div className="flex gap-1">
                          {sug.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onApproveSuggestion(sug.id)}
                                className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-zinc-850 rounded-lg transition cursor-pointer"
                                title="Aprovar Sugestão"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onRejectSuggestion(sug.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-850 rounded-lg transition cursor-pointer"
                                title="Recusar Sugestão"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {suggestionIdToDelete === sug.id ? (
                            <div className="flex items-center gap-1.5 bg-zinc-900 border border-red-500/30 rounded-xl p-1 animate-fadeIn">
                              <span className="text-[10px] text-zinc-400 px-1 font-semibold font-sans">Excluir?</span>
                              <button
                                onClick={() => {
                                  onDeleteSuggestion(sug.id);
                                  setSuggestionIdToDelete(null);
                                }}
                                className="text-[10px] bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 rounded-lg transition cursor-pointer"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setSuggestionIdToDelete(null)}
                                className="text-[10px] bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold px-2 py-1 rounded-lg transition cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSuggestionIdToDelete(sug.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                              title="Excluir Sugestão"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-sm gap-2">
                <HelpCircle className="w-8 h-8 text-zinc-700" />
                <span>Nenhuma sugestão encontrada para o filtro atual</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
