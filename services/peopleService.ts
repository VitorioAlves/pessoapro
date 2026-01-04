import { supabase } from './supabase';
import { Person, Situacao } from '../types';

export const peopleService = {
    async fetchPeople(): Promise<Person[]> {
        const { data, error } = await supabase
            .from('people')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching people:', error);
            throw error;
        }

        return (data || []).map(p => ({
            id: p.id,
            nome: p.nome || '',
            cpf: p.cpf || '',
            mai: p.mai || '',
            dataCadastro: p.data_cadastro || new Date().toISOString().split('T')[0],
            contatos: p.contatos || '',
            observacoes: p.observacoes || '',
            situacao: (p.situacao as Situacao) || Situacao.PENDENTE
        }));
    },

    async savePerson(person: Omit<Person, 'id'> & { id?: string }): Promise<Person> {
        const payload = {
            nome: person.nome,
            cpf: person.cpf,
            mai: person.mai,
            data_cadastro: person.dataCadastro,
            contatos: person.contatos,
            observacoes: person.observacoes,
            situacao: person.situacao
        };

        let result;
        if (person.id && person.id.length > 20) { // Check if it's a UUID or a mock ID
            const { data, error } = await supabase
                .from('people')
                .update(payload)
                .eq('id', person.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from('people')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return {
            id: result.id,
            nome: result.nome,
            cpf: result.cpf,
            mai: result.mai,
            dataCadastro: result.data_cadastro,
            contatos: result.contatos,
            observacoes: result.observacoes,
            situacao: result.situacao as Situacao
        };
    },

    async deletePerson(id: string): Promise<void> {
        const { error } = await supabase
            .from('people')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
