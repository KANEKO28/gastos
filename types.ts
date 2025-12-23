export interface Commercial {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ExpenseType {
  id: string;
  name: string; // e.g., "Desplazamientos", "Comidas"
}

export interface Expense {
  id: string;
  date: string;
  creditor: string; // The merchant/supplier
  amount: number;
  commercialId: string;
  typeId: string;
  observations: string;
  receiptImage: string; // Base64 string
}

export interface FilterState {
  commercialId: string;
  typeId: string;
  year: string;
  month: string;
}

export enum View {
  EXPENSES = 'EXPENSES',
  COMMERCIALS = 'COMMERCIALS',
  TYPES = 'TYPES',
  HISTORY = 'HISTORY',
}
