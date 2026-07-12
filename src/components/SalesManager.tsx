/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  FileText, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  UtensilsCrossed,
  DollarSign
} from 'lucide-react';
import { SaleRecord, SaleItem } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SalesManagerProps {
  sales: SaleRecord[];
  onAddSale: (sale: SaleRecord) => void;
  onDeleteSale: (id: string) => void;
}

const COMMON_ITEMS = [
  { name: 'Pastel de Carne', defaultCost: 2.50, defaultPrice: 6.00 },
  { name: 'Pastel de Queijo', defaultCost: 2.50, defaultPrice: 6.00 },
  { name: 'Pastel de Frango', defaultCost: 2.50, defaultPrice: 6.00 },
  { name: 'Refrigerante Lata', defaultCost: 2.00, defaultPrice: 5.00 },
  { name: 'Suco Natural', defaultCost: 1.50, defaultPrice: 4.00 },
  { name: 'Cachorro Quente', defaultCost: 3.50, defaultPrice: 8.00 },
  { name: 'Bolo Fatia', defaultCost: 1.50, defaultPrice: 4.50 },
  { name: 'Água Mineral', defaultCost: 0.80, defaultPrice: 3.00 },
];

export default function SalesManager({ sales, onAddSale, onDeleteSale }: SalesManagerProps) {
  // Form State
  const [date, setDate] = useState<string>(() => {
    // Default to today in YYYY-MM-DD
    return new Date().toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  
  // Sale Items being added in current form
  const [currentItems, setCurrentItems] = useState<Omit<SaleItem, 'id'>[]>([
    { name: 'Pastel de Carne', quantity: 20, unitCost: 2.50, unitPrice: 6.00 }
  ]);

  // Form individual item inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState<number>(10);
  const [newItemTotalCost, setNewItemTotalCost] = useState<number>(25.00);
  const [newItemPrice, setNewItemPrice] = useState<number>(6.00);

  // Search and Expand States
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSales, setExpandedSales] = useState<{ [key: string]: boolean }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [saleIdToDelete, setSaleIdToDelete] = useState<string | null>(null);

  // Handle preset selection to populate form fields
  const handleSelectPreset = (preset: typeof COMMON_ITEMS[0]) => {
    setNewItemName(preset.name);
    setNewItemTotalCost(parseFloat((preset.defaultCost * newItemQty).toFixed(2)));
    setNewItemPrice(preset.defaultPrice);
  };

  // Helper to change quantity and automatically adjust total cost if a preset is active
  const handleQtyChange = (qty: number) => {
    setNewItemQty(qty);
    const matchedPreset = COMMON_ITEMS.find(item => item.name.toLowerCase() === newItemName.toLowerCase());
    if (matchedPreset) {
      setNewItemTotalCost(parseFloat((matchedPreset.defaultCost * qty).toFixed(2)));
    }
  };

  // Add individual item to the temporary list
  const handleAddItemToRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemQty <= 0) return;

    // Derived unit cost = total cost / quantity
    const calculatedUnitCost = parseFloat((newItemTotalCost / newItemQty).toFixed(4));

    // Check if item already exists in current list, aggregate if yes
    const existingIndex = currentItems.findIndex(item => item.name.toLowerCase() === newItemName.trim().toLowerCase());
    if (existingIndex !== -1) {
      const updated = [...currentItems];
      updated[existingIndex].quantity += newItemQty;
      // Derived new average unit cost
      const newTotalCost = (updated[existingIndex].quantity * updated[existingIndex].unitCost) + newItemTotalCost;
      updated[existingIndex].unitCost = parseFloat((newTotalCost / updated[existingIndex].quantity).toFixed(4));
      updated[existingIndex].unitPrice = newItemPrice;
      setCurrentItems(updated);
    } else {
      setCurrentItems([
        ...currentItems,
        {
          name: newItemName.trim(),
          quantity: newItemQty,
          unitCost: calculatedUnitCost,
          unitPrice: newItemPrice
        }
      ]);
    }

    // Reset item input form
    setNewItemName('');
    setNewItemQty(10);
    setNewItemTotalCost(25.00);
    setNewItemPrice(6.00);
  };

  // Remove individual item from temporary list
  const handleRemoveItemFromRecord = (index: number) => {
    setCurrentItems(currentItems.filter((_, i) => i !== index));
  };

  // Submit complete Sale Record
  const handleSubmitSaleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItems.length === 0) {
      alert('Por favor, adicione pelo menos um item à venda.');
      return;
    }

    // Process total costs and revenue
    const processedItems: SaleItem[] = currentItems.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      ...item
    }));

    const totalCost = processedItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const totalRevenue = processedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const netProfit = totalRevenue - totalCost;

    const newRecord: SaleRecord = {
      id: `sale-${Date.now()}`,
      date,
      items: processedItems,
      totalCost,
      totalRevenue,
      netProfit,
      notes: notes.trim() || undefined
    };

    onAddSale(newRecord);
    
    // Reset Form
    setCurrentItems([{ name: 'Pastel de Queijo', quantity: 15, unitCost: 2.50, unitPrice: 6.00 }]);
    setNotes('');
    setSuccessMessage('Ação de vendas registrada com sucesso!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Toggle record details expansion
  const toggleExpand = (id: string) => {
    setExpandedSales(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter sales list based on search term
  const filteredSales = sales.filter(sale => {
    const formattedDate = sale.date.split('-').reverse().join('/');
    const matchesDate = formattedDate.includes(searchTerm);
    const matchesNotes = sale.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesItems = sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDate || matchesNotes || matchesItems;
  });

  // Calculate stats for currentItems preview
  const previewCost = currentItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const previewRevenue = currentItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const previewProfit = previewRevenue - previewCost;

  // ----------------------------------------------------
  // PDF REPORT GENERATOR WITH jsPDF & AUTO-TABLE
  // ----------------------------------------------------
  const generatePdfReport = () => {
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = [249, 115, 22]; // Orange-500
    const darkGray = [24, 24, 27];       // Slate dark
    
    // Header banner
    doc.setFillColor(24, 24, 27);
    doc.rect(0, 0, 210, 38, 'F');
    
    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SABOR CENTRAL', 15, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('Relatório Financeiro de Gestão - Cantina Dominical Pós-Culto', 15, 24);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 30);
    
    // Canteen Metrics Summary Box
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(15, 45, 180, 30, 3, 3, 'FD');
    
    const totalRev = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalCst = sales.reduce((sum, s) => sum + s.totalCost, 0);
    const netPrf = totalRev - totalCst;
    const roiPct = totalCst > 0 ? (netPrf / totalCst) * 100 : 0;
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.text('TOTAL ARRECADADO', 20, 52);
    doc.text('TOTAL INVESTIDO', 70, 52);
    doc.text('LUCRO LÍQUIDO', 120, 52);
    doc.text('RETORNO (ROI)', 165, 52);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(`R$ ${totalRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 60);
    doc.text(`R$ ${totalCst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 70, 60);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text(`R$ ${netPrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 120, 60);
    doc.setTextColor(249, 115, 22); // Orange-500
    doc.text(`${roiPct.toFixed(0)}%`, 165, 60);
    
    // Main Sales list table data formatting
    const tableBody: any[] = [];
    
    sales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(sale => {
      const formattedDate = sale.date.split('-').reverse().join('/');
      const itemDescriptions = sale.items.map(it => `${it.name} (${it.quantity}x)`).join('\n');
      
      tableBody.push([
        formattedDate,
        itemDescriptions,
        `R$ ${sale.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${sale.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${sale.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        sale.notes || '-'
      ]);
    });
    
    // Create autotable
    autoTable(doc, {
      startY: 85,
      head: [['Data', 'Itens Vendidos', 'Custo (Investido)', 'Arrecadado', 'Lucro Líquido', 'Observações']],
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 32 },
        3: { cellWidth: 32 },
        4: { cellWidth: 32 },
      },
    });
    
    // Page footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Sabor Central - Relatório Geral de Lançamentos - Página ${i} de ${pageCount}`, 15, 287);
    }
    
    // Trigger download
    doc.save(`Sabor_Central_Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
            Gestão de Lançamentos
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Registre novas ações de vendas dominicais e analise o histórico financeiro
          </p>
        </div>
        
        {sales.length > 0 && (
          <button
            onClick={generatePdfReport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition duration-300 glow-button cursor-pointer"
          >
            <FileText className="w-4.5 h-4.5" />
            <span>Gerar Relatório Geral (PDF)</span>
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400 animate-pulse text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Two-Column Layout for Input and History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form to Add Sales */}
        <div className="lg:col-span-5 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-5 sm:p-6 flex flex-col justify-between">
          <form onSubmit={handleSubmitSaleRecord} className="space-y-6">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Plus className="w-5 h-5 text-orange-500" />
              <span>Registrar Nova Ação de Venda</span>
            </h3>

            {/* Date Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Data do Culto (Domingo)</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 font-mono transition"
              />
            </div>

            {/* Subform to add single items to current Sales Action */}
            <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/80 space-y-4">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                <span>Adicionar Itens Vendidos</span>
                <span className="text-zinc-500 normal-case font-normal">(monte o cardápio do dia)</span>
              </h4>

              {/* Presets Row */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Sugestões Rápidas:</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {COMMON_ITEMS.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition cursor-pointer min-h-[34px] flex items-center justify-center"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-inputs */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nome do Alimento / Bebida"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Qtd</label>
                    <input
                      type="number"
                      min="1"
                      value={newItemQty}
                      onChange={(e) => handleQtyChange(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Custo Total (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItemTotalCost}
                      onChange={(e) => setNewItemTotalCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Venda Un (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Live calculation helper */}
                {newItemName.trim() && (
                  <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <div>
                      <span>Total Venda: </span>
                      <span className="text-zinc-200 font-bold">R$ {(newItemQty * newItemPrice).toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span>Lucro Previsto: </span>
                      <span className={`font-bold ${((newItemQty * newItemPrice) - newItemTotalCost) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        R$ {((newItemQty * newItemPrice) - newItemTotalCost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddItemToRecord}
                  disabled={!newItemName.trim()}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 text-zinc-200 text-xs font-semibold py-2 rounded-xl border border-zinc-700 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Incluir no Lançamento</span>
                </button>
              </div>
            </div>

            {/* List of currently entered items for this day's sale */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Lista de Itens deste Lançamento ({currentItems.length})
              </span>
              
              {currentItems.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {currentItems.map((item, index) => {
                    const itemTotalCost = item.quantity * item.unitCost;
                    const itemTotalRev = item.quantity * item.unitPrice;
                    const itemProfit = itemTotalRev - itemTotalCost;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-xs gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-white block truncate">{item.name}</span>
                          <span className="text-zinc-500 block sm:inline">
                            {item.quantity}un • Custo Total R$ {itemTotalCost.toFixed(2)} • Venda Un R$ {item.unitPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 block font-sans">Lucro</span>
                            <span className="font-bold text-emerald-400 font-mono">
                              R$ {itemProfit.toFixed(2)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromRecord(index)}
                            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 text-center text-zinc-500 text-xs flex flex-col items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 text-zinc-700" />
                  <span>Por favor, inclua itens acima para registrar a venda.</span>
                </div>
              )}
            </div>

            {/* Preview of Totals */}
            {currentItems.length > 0 && (
              <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10 space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Custo total estimado (Investimento):</span>
                  <span className="font-mono text-zinc-300">R$ {previewCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Arrecadação estimada (Receita):</span>
                  <span className="font-mono text-zinc-300">R$ {previewRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-200 font-bold pt-2 border-t border-zinc-800">
                  <span>Lucro líquido estimado:</span>
                  <span className="font-mono text-emerald-400">R$ {previewProfit.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Observações Gerais (Opcional)
              </label>
              <textarea
                placeholder="Ex: Arrecadação destinada ao retiro de jovens de agosto"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition resize-none"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={currentItems.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-300 glow-button flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Salvar Lançamento do Dia</span>
            </button>
          </form>
        </div>

        {/* Right Column: History List */}
        <div className="lg:col-span-7 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-5 sm:p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              <span>Histórico de Ações Recentes</span>
            </h3>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por item, data, obs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:outline-none focus:border-orange-500 w-full sm:w-56 font-mono"
              />
            </div>
          </div>

          {/* Table/List content */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[640px] pr-1">
            {filteredSales.length > 0 ? (
              filteredSales
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((sale) => {
                  const isExpanded = !!expandedSales[sale.id];
                  const displayDate = sale.date.split('-').reverse().join('/');
                  
                  return (
                    <div 
                      key={sale.id}
                      className="bg-zinc-950/80 border border-zinc-850 rounded-xl overflow-hidden transition duration-300 hover:border-zinc-750"
                    >
                      {/* Main summary row */}
                      <div 
                        onClick={() => toggleExpand(sale.id)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-zinc-400 font-mono text-center min-w-[70px]">
                            <span className="block text-[10px] text-zinc-500 font-sans uppercase font-bold">Data</span>
                            <span className="text-xs font-semibold text-zinc-200">{displayDate}</span>
                          </div>

                          <div>
                            <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider">
                              {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'} lançado{sale.items.length === 1 ? '' : 's'}
                            </span>
                            <span className="text-sm text-zinc-300 mt-0.5 block truncate max-w-[200px] sm:max-w-xs font-medium">
                              {sale.items.map(it => `${it.name} (${it.quantity}x)`).join(', ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t border-zinc-900 sm:border-0">
                          <div className="text-right">
                            <span className="block text-[10px] text-zinc-500 uppercase font-bold">Lucro Líquido</span>
                            <span className="text-sm font-bold text-emerald-400 font-mono">
                              R$ {sale.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {saleIdToDelete === sale.id ? (
                              <div className="flex items-center gap-1.5 bg-zinc-900 border border-red-500/30 rounded-xl p-1 animate-fadeIn">
                                <span className="text-[10px] text-zinc-400 px-1.5 font-semibold font-sans">Excluir?</span>
                                <button
                                  onClick={() => {
                                    onDeleteSale(sale.id);
                                    setSaleIdToDelete(null);
                                  }}
                                  className="text-[10px] bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 rounded-lg transition cursor-pointer"
                                >
                                  Sim
                                </button>
                                <button
                                  onClick={() => setSaleIdToDelete(null)}
                                  className="text-[10px] bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold px-2 py-1 rounded-lg transition cursor-pointer"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSaleIdToDelete(sale.id)}
                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition duration-300 cursor-pointer"
                                title="Excluir Lançamento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => toggleExpand(sale.id)}
                              className="p-2 text-zinc-400 hover:text-white rounded-lg transition duration-300 cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details Panel */}
                      {isExpanded && (
                        <div className="bg-zinc-900/40 px-4 py-4 border-t border-zinc-900 space-y-4 text-xs">
                          {/* Items Breakdown Table */}
                          <div className="space-y-1.5">
                            <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider block">Detalhamento Financeiro do Lançamento:</span>
                            <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                              <table className="w-full text-left min-w-[550px]">
                                <thead className="bg-zinc-900/80 text-zinc-400 text-[10px] uppercase font-bold">
                                  <tr>
                                    <th className="p-2 px-3">Item</th>
                                    <th className="p-2 text-center">Quantidade</th>
                                    <th className="p-2 text-right">Custo Total</th>
                                    <th className="p-2 text-right">Arrecadado</th>
                                    <th className="p-2 text-right">Lucro Líquido</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                  {sale.items.map((item) => {
                                    const totalItemCost = item.quantity * item.unitCost;
                                    const totalItemRev = item.quantity * item.unitPrice;
                                    const totalItemProfit = totalItemRev - totalItemCost;
                                    return (
                                      <tr key={item.id} className="hover:bg-zinc-900/20">
                                        <td className="p-2 px-3 font-semibold text-white">{item.name}</td>
                                        <td className="p-2 text-center font-mono">{item.quantity} un</td>
                                        <td className="p-2 text-right font-mono text-zinc-400">R$ {totalItemCost.toFixed(2)}</td>
                                        <td className="p-2 text-right font-mono text-zinc-300">R$ {totalItemRev.toFixed(2)}</td>
                                        <td className="p-2 text-right font-mono text-emerald-400 font-semibold">R$ {totalItemProfit.toFixed(2)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Notes */}
                          {sale.notes && (
                            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/60 text-zinc-400">
                              <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-0.5">Observações:</span>
                              <p className="italic">{sale.notes}</p>
                            </div>
                          )}

                          {/* Overall Sale Math Summary */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-zinc-950 rounded-xl border border-zinc-850 text-zinc-400 font-mono text-center sm:text-left">
                            <div className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/20 sm:bg-transparent sm:p-0 sm:border-0">
                              <span className="text-[10px] text-zinc-500 block sm:inline uppercase sm:normal-case font-sans sm:font-mono">Custo total: </span>
                              <strong className="text-zinc-300 block sm:inline mt-0.5 sm:mt-0 text-xs sm:text-inherit">R$ {sale.totalCost.toFixed(2)}</strong>
                            </div>
                            <div className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/20 sm:bg-transparent sm:p-0 sm:border-0">
                              <span className="text-[10px] text-zinc-500 block sm:inline uppercase sm:normal-case font-sans sm:font-mono">Arrecadação: </span>
                              <strong className="text-zinc-300 block sm:inline mt-0.5 sm:mt-0 text-xs sm:text-inherit">R$ {sale.totalRevenue.toFixed(2)}</strong>
                            </div>
                            <div className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/20 sm:bg-transparent sm:p-0 sm:border-0">
                              <span className="text-[10px] text-zinc-500 block sm:inline uppercase sm:normal-case font-sans sm:font-mono">Lucro do Dia: </span>
                              <strong className="text-emerald-400 font-bold block sm:inline mt-0.5 sm:mt-0 text-sm sm:text-inherit">R$ {sale.netProfit.toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-sm gap-2">
                <HelpCircle className="w-8 h-8 text-zinc-700" />
                <span>Nenhum lançamento de vendas atende ao filtro de busca</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
