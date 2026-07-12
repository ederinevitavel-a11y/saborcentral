/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Send, 
  Utensils, 
  User, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft,
  Plus
} from 'lucide-react';
import { FoodSuggestion } from '../types';

interface SuggestionFormProps {
  onAddSuggestion: (suggestion: Omit<FoodSuggestion, 'id' | 'date' | 'status' | 'upvotes'>) => void;
  onBackToAdmin?: () => void;
  initialUserName?: string;
  isLoggedIn?: boolean;
}

export default function SuggestionForm({ onAddSuggestion, onBackToAdmin, initialUserName = '', isLoggedIn = false }: SuggestionFormProps) {
  const [foodName, setFoodName] = useState('');
  const [submittedBy, setSubmittedBy] = useState(initialUserName);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !submittedBy.trim()) return;

    onAddSuggestion({
      foodName: foodName.trim(),
      submittedBy: submittedBy.trim()
    });

    setSubmitted(true);
    setFoodName('');
    // Notice: we do not clear submittedBy here so the user doesn't have to retype their name for another suggestion.
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      
      {/* Decorative gradient glowing spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Container Card */}
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-850 p-6 sm:p-8 rounded-3xl relative z-10 glow-card">
        
        {/* Back button inside the card for guaranteed mobile visibility */}
        {onBackToAdmin && (
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
            <button
              type="button"
              onClick={onBackToAdmin}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition px-3 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl cursor-pointer font-medium active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isLoggedIn ? 'Voltar ao Painel' : 'Voltar ao Início'}</span>
            </button>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
              Visualização Cliente
            </span>
          </div>
        )}
        
        {/* Brand & Canteen details */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
            <Utensils className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest font-extrabold uppercase text-orange-500">
              SABOR CENTRAL • CANTINA DOMINICAL
            </span>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight mt-1">
              Qual produto ou prato você gostaria que fosse vendido na cantina da igreja?
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Envie sua sugestão de prato, salgado ou doce diretamente para a equipe organizadora!
            </p>
          </div>
        </div>

        {submitted ? (
          /* Success Screen */
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="mx-auto w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Sugestão Enviada!</h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                A equipe administrativa do Sabor Central recebeu sua sugestão e vai analisar a viabilidade para os próximos domingos!
              </p>
            </div>

            <div className="py-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Obrigado por ajudar nossa cantina!</span>
              </span>
            </div>

            <div className="pt-4 flex flex-col gap-2.5 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Enviar Outra Sugestão</span>
              </button>

              {onBackToAdmin && (
                <button
                  type="button"
                  onClick={onBackToAdmin}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold py-3 px-4 rounded-xl border border-zinc-800 transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider active:scale-98"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isLoggedIn ? 'Voltar ao Painel' : 'Voltar ao Início'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input: Food Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-zinc-500" />
                <span>Prato / Alimento sugerido</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Pastel de Frango com Catupiry, Brigadeirão..."
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3.5 text-white text-sm transition"
              />
            </div>

            {/* Input: Submitter Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span>Seu Nome</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Pedro Henrique, Aline..."
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-xl px-4 py-3.5 text-white text-sm transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-orange-500/10 transition duration-300 flex items-center justify-center gap-2 glow-button cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Sugestão à Equipe</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center text-[10px] text-zinc-600 mt-8 border-t border-zinc-850/60 pt-4">
          Coded with ♥ for Sabor Central • Gestão Dominical Pós-Culto
        </div>
      </div>
    </div>
  );
}
