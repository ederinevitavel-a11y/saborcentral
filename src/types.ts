/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;  // Cost to make/buy
  unitPrice: number; // Sale price
}

export interface SaleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  items: SaleItem[];
  totalCost: number;
  totalRevenue: number;
  netProfit: number;
  notes?: string;
}

export interface AgendaEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: string; // e.g., 'Salgados', 'Bebidas', 'Doces', 'Eventos Especiais'
  responsible: string;
  status: 'pending' | 'completed' | 'canceled';
}

export interface FoodSuggestion {
  id: string;
  foodName: string;
  submittedBy: string;
  date: string; // ISO Date String
  status: 'pending' | 'approved' | 'rejected';
  upvotes: number;
}
