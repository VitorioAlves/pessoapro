
export enum Situacao {
  IH = 'IH',
  BLOQUEIO = 'Bloqueio',
  RFB = 'RFB',
  REJEITADO = 'Rejeitado',
  AUTORIZADO = 'Autorizado',
  LIBERADO = 'Liberado',
  PENDENTE = 'Pendente' // Added for metrics as requested
}

export interface Person {
  id: string;
  nome: string;
  cpf: string;
  mai: string;
  dataCadastro: string;
  contatos: string;
  observacoes: string;
  situacao: Situacao;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'operador';
}

export type AppView = 'login' | 'register' | 'dashboard' | 'records' | 'settings';
