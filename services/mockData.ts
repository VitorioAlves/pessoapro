
import { Person, Situacao } from '../types';

const INITIAL_PEOPLE: Person[] = [
  {
    id: '1',
    nome: 'Ricardo Oliveira',
    cpf: '123.456.789-00',
    mai: 'MAI-2024-001',
    dataCadastro: '2024-01-15',
    contatos: 'ricardo@email.com, (11) 98888-7777',
    observacoes: 'Registro inicial para teste de sistema.',
    situacao: Situacao.AUTORIZADO,
  },
  {
    id: '2',
    nome: 'Fernanda Souza',
    cpf: '234.567.890-11',
    mai: 'MAI-2024-002',
    dataCadastro: '2024-02-10',
    contatos: 'fernanda.s@email.com',
    observacoes: 'Aguardando documentação complementar.',
    situacao: Situacao.IH,
  },
  {
    id: '3',
    nome: 'Carlos Eduardo',
    cpf: '345.678.901-22',
    mai: 'MAI-2024-003',
    dataCadastro: '2024-03-05',
    contatos: '(21) 97777-6666',
    observacoes: 'Problemas técnicos no envio do MAI.',
    situacao: Situacao.PENDENTE,
  },
  {
    id: '4',
    nome: 'Beatriz Santos',
    cpf: '456.789.012-33',
    mai: 'MAI-2024-004',
    dataCadastro: '2024-03-12',
    contatos: 'beatriz.adm@empresa.com',
    observacoes: 'Acesso liberado para área restrita.',
    situacao: Situacao.LIBERADO,
  },
  {
    id: '5',
    nome: 'Marcos Vinicius',
    cpf: '567.890.123-44',
    mai: 'MAI-2024-005',
    dataCadastro: '2024-03-20',
    contatos: 'marcos@email.com',
    observacoes: 'Restrição detectada na consulta RFB.',
    situacao: Situacao.RFB,
  }
];

export const getStoredPeople = (): Person[] => {
  const stored = localStorage.getItem('gpp_people');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return INITIAL_PEOPLE;
    }
  }
  return INITIAL_PEOPLE;
};

export const savePeople = (people: Person[]) => {
  localStorage.setItem('gpp_people', JSON.stringify(people));
};
