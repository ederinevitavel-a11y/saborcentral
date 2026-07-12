/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  ArrowUpRight, 
  ShoppingBag, 
  CalendarDays,
  Utensils
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { SaleRecord, AgendaEvent } from '../types';

interface DashboardProps {
  sales: SaleRecord[];
  events: AgendaEvent[];
}

export default function Dashboard({ sales, events }: DashboardProps) {
  // 1. Calculate Financial Metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
  const totalCost = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
  const netProfit = totalRevenue - totalCost;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  // 2. Prepare Chart Data for Timeline (aggregate by date)
  const chronologicalSales = [...sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const timelineData = chronologicalSales.map(sale => {
    // Format date beautifully (DD/MM)
    const [year, month, day] = sale.date.split('-');
    const formattedDate = `${day}/${month}`;
    return {
      date: formattedDate,
      Arrecadado: sale.totalRevenue,
      Investido: sale.totalCost,
      Lucro: sale.netProfit,
    };
  });

  // 3. Prepare Item Popularity & Financial Performance data
  const itemPerformanceMap: { [key: string]: { quantity: number; revenue: number; cost: number; profit: number } } = {};
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const name = item.name.trim();
      if (!itemPerformanceMap[name]) {
        itemPerformanceMap[name] = { quantity: 0, revenue: 0, cost: 0, profit: 0 };
      }
      const itemCost = item.quantity * item.unitCost;
      const itemRevenue = item.quantity * item.unitPrice;
      const itemProfit = itemRevenue - itemCost;
      
      itemPerformanceMap[name].quantity += item.quantity;
      itemPerformanceMap[name].revenue += itemRevenue;
      itemPerformanceMap[name].cost += itemCost;
      itemPerformanceMap[name].profit += itemProfit;
    });
  });

  const bestSellers = Object.entries(itemPerformanceMap)
    .map(([name, stats]) => ({
      name,
      ...stats
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Colors for the pie chart / items
  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#eab308', '#ec4899', '#14b8a6'];

  // Upcoming planned actions
  const pendingEvents = events
    .filter(e => e.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Heading */}
      <div>
        <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
          Painel de Controle Financeiro
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Visão consolidada e métricas de desempenho da Cantina Dominical
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Arrecadado */}
        <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-zinc-800/80 hover:border-orange-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">Total Arrecadado (Receita)</span>
            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-white">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-zinc-500 text-xs">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>Soma de todas as vendas</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Investido */}
        <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-zinc-800/80 hover:border-blue-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">Total Investido (Custo)</span>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-white">
              R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-zinc-500 text-xs">
              <span>Custo dos insumos e matérias-primas</span>
            </div>
          </div>
        </div>

        {/* Card 3: Lucro Líquido */}
        <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-zinc-800/80 hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">Lucro Líquido</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-emerald-400">
              R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-emerald-500 text-xs">
              <span className="font-semibold">{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(0) : 0}%</span>
              <span className="text-zinc-500">de margem de lucro</span>
            </div>
          </div>
        </div>

        {/* Card 4: ROI */}
        <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-zinc-800/80 hover:border-purple-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">Retorno s/ Investimento (ROI)</span>
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-display font-bold text-white">
              {roi.toFixed(0)}%
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-zinc-500 text-xs">
              <span>Retorno líquido sobre o custo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart */}
        <div className="lg:col-span-2 bg-zinc-900/50 rounded-2xl p-5 sm:p-6 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-display font-semibold text-white">Evolução Financeira</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Histórico de arrecadação, custo e lucro por dia de vendas</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArrecadado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '13px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="Arrecadado" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorArrecadado)" />
                  <Area type="monotone" dataKey="Lucro" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLucro)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm gap-2">
                <ShoppingBag className="w-8 h-8 text-zinc-700 animate-pulse" />
                <span>Nenhum dado de vendas registrado para gerar gráfico</span>
              </div>
            )}
          </div>
        </div>

        {/* Best Sellers Side Panel */}
        <div className="bg-zinc-900/50 rounded-2xl p-5 sm:p-6 border border-zinc-800/80 flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-display font-semibold text-white">Ranking de Itens</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Mais vendidos e lucrativos da cantina</p>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-72 pr-1">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, index) => {
                const color = COLORS[index % COLORS.length];
                const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
                
                return (
                  <div key={item.name} className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-semibold text-white">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        +{percentage.toFixed(0)}% Rec.
                      </span>
                    </div>

                    <div className="flex justify-between items-end text-xs text-zinc-400 mt-1">
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase font-bold">Unidades</span>
                        <span className="font-semibold text-zinc-300 text-sm">{item.quantity} un</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-zinc-500 uppercase font-bold">Lucro Líquido</span>
                        <span className="font-semibold text-white text-sm">
                          R$ {item.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(5, percentage)}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm gap-2 py-10">
                <Utensils className="w-8 h-8 text-zinc-700" />
                <span>Nenhum item vendido ainda</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Planning Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Scheduled Action */}
        <div className="bg-zinc-900/50 rounded-2xl p-5 sm:p-6 border border-zinc-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-semibold text-white">Próximo Lançamento Planejado</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Atividade agendada de maior prioridade</p>
            </div>
          </div>

          {pendingEvents.length > 0 ? (
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div className="space-y-2">
                  <span className="inline-block text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-semibold">
                    {pendingEvents[0].category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">{pendingEvents[0].title}</h4>
                  <p className="text-sm text-zinc-400 mt-1">{pendingEvents[0].description}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="block text-xs font-bold text-zinc-500 uppercase">Data</span>
                  <span className="text-sm font-semibold text-white font-mono">
                    {pendingEvents[0].date.split('-').reverse().join('/')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs text-zinc-500">
                <span>Responsável: <strong className="text-zinc-300 font-medium">{pendingEvents[0].responsible}</strong></span>
                <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded w-fit">Planejado</span>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center text-zinc-500 text-sm flex flex-col items-center gap-2">
              <CalendarDays className="w-6 h-6 text-zinc-700" />
              <span>Nenhum evento agendado pendente</span>
            </div>
          )}
        </div>

        {/* Dynamic Tips & Canteen Info */}
        <div className="bg-zinc-900/50 rounded-2xl p-5 sm:p-6 border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-display font-semibold text-white">Dicas Sabor Central</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Conselhos rápidos para otimizar os lucros da cantina</p>
          </div>

          <div className="my-4 space-y-3">
            <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/30 text-xs text-zinc-300">
              💡 <strong className="text-white">Foque nos campeões de margem:</strong> Salgados tradicionais como pasteis costumam ter o melhor custo-benefício de fabricação.
            </div>
            <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/30 text-xs text-zinc-300">
              📊 <strong className="text-white">Controle de perdas:</strong> Monitore as quantidades registradas versus as consumidas para calibrar o volume de compras na próxima semana.
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/50 flex justify-between items-center text-[11px] text-zinc-500">
            <span>Status do Sistema: <strong className="text-emerald-400">Offline-Ready (Local)</strong></span>
            <span>Versão: v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
