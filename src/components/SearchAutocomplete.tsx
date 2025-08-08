import React, { useEffect, useMemo, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/contexts/CartContext';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectProduct?: (product: Product) => void;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ value, onChange, onSelectProduct }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // carregar histórico do localStorage
    try {
      const raw = localStorage.getItem('search_history');
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const term = value.trim();
      if (term.length < 3) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, price, image_url, category')
          .ilike('name', `%${term}%`)
          .limit(8);
        if (error) throw error;
        setSuggestions((data as Product[]) || []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const id = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(id);
  }, [value]);

  const filteredHistory = useMemo(() => {
    const t = value.trim().toLowerCase();
    if (t.length < 3) return [];
    return history.filter(h => h.toLowerCase().includes(t)).slice(0, 5);
  }, [value, history]);

  const saveHistory = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...history.filter(h => h.toLowerCase() !== t.toLowerCase())].slice(0, 10);
    setHistory(next);
    try { localStorage.setItem('search_history', JSON.stringify(next)); } catch {}
  };

  const handleSelect = (p: Product) => {
    saveHistory(p.name);
    onSelectProduct?.(p);
    navigate('/', { replace: false });
  };

  const shouldOpen = isFocused && value.trim().length >= 3 && (loading || suggestions.length > 0 || filteredHistory.length > 0);

  return (
    <div className="relative">
      <Command
        className="rounded-lg border bg-background"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        shouldFilter={false}
        filter={(value, search) => {
          // evita erros com valores indefinidos no cmdk
          if (!value || !search) return 1;
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
        }}
      >
        <CommandInput
          value={value}
          onValueChange={onChange}
          placeholder="Buscar produtos..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveHistory(value);
            }
          }}
        />
        <CommandList
          className={`absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-medium ${shouldOpen ? '' : 'hidden'}`}
        >
          {loading ? (
            <div className="p-3 text-sm text-muted-foreground">Carregando...</div>
          ) : (
            <>
              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
              {filteredHistory.length > 0 && (
                <CommandGroup heading="Pesquisas recentes">
                  {filteredHistory.map((h) => (
                    <CommandItem key={h} value={h} onSelect={() => onChange(h)}>
                      {h}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup heading="Sugestões">
                {suggestions.map((p) => (
                  <CommandItem key={p.id} value={p.name} onSelect={() => handleSelect(p)}>
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded object-cover" />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{p.category}</div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </div>
  );
};


