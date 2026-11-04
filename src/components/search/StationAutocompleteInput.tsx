import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, ChevronDown, Check, Building2 } from 'lucide-react';
import { StationData } from '../../types/index.ts';

interface StationAutocompleteInputProps {
  id: string;
  label: string;
  value: string; // Station code (e.g. 'NDLS')
  onChange: (stationCode: string) => void;
  stations: StationData[];
  placeholder?: string;
  icon?: React.ReactNode;
  iconColorClass?: string;
  error?: string | null;
  disabled?: boolean;
}

export const StationAutocompleteInput: React.FC<StationAutocompleteInputProps> = ({
  id,
  label,
  value,
  onChange,
  stations,
  placeholder = 'Type station name or code...',
  icon,
  iconColorClass = 'text-blue-900',
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Sync display text with selected station code from props
  useEffect(() => {
    if (value) {
      const matched = stations.find(s => s.code.toUpperCase() === value.toUpperCase());
      if (matched) {
        setQuery(`${matched.name} (${matched.code})`);
      } else {
        setQuery(value);
      }
    } else {
      setQuery('');
    }
  }, [value, stations]);

  // Filter stations based on user typed text with multi-field relevance scoring
  const filteredStations = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default: show popular/major stations
      return stations.slice(0, 16);
    }

    return stations
      .map(s => {
        const code = s.code.toLowerCase();
        const name = s.name.toLowerCase();
        const city = s.city.toLowerCase();
        const state = s.state.toLowerCase();
        const zone = s.zone.toLowerCase();
        const div = (s.division || '').toLowerCase();
        const aliases = (s.aliases || []).map(a => a.toLowerCase());

        let score = 0;
        if (code === q) score += 1000;
        else if (code.startsWith(q)) score += 800;
        else if (name === q) score += 700;
        else if (aliases.some(a => a === q)) score += 650;
        else if (name.startsWith(q)) score += 600;
        else if (city.startsWith(q)) score += 500;
        else if (aliases.some(a => a.startsWith(q))) score += 450;
        else if (name.split(/\s+/).some(word => word.startsWith(q))) score += 400;
        else if (city.split(/\s+/).some(word => word.startsWith(q))) score += 350;
        else if (name.includes(q)) score += 250;
        else if (city.includes(q)) score += 200;
        else if (code.includes(q)) score += 180;
        else if (aliases.some(a => a.includes(q))) score += 150;
        else if (state.includes(q) || zone.includes(q) || div.includes(q)) score += 100;

        return { station: s, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.station.name.localeCompare(b.station.name);
      })
      .map(item => item.station)
      .slice(0, 25);
  }, [stations, query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Reset query text to selected station if user didn't choose anything
        if (value) {
          const matched = stations.find(s => s.code.toUpperCase() === value.toUpperCase());
          if (matched) setQuery(`${matched.name} (${matched.code})`);
        } else {
          setQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, stations]);

  // Keep highlighted index in view when navigating with keyboard
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('li');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelectStation = (station: StationData) => {
    onChange(station.code);
    setQuery(`${station.name} (${station.code})`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1 < filteredStations.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredStations.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredStations[highlightedIndex]) {
        handleSelectStation(filteredStations[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectedStationObj = stations.find(s => s.code.toUpperCase() === value.toUpperCase());

  return (
    <div ref={containerRef} className="relative space-y-1 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          {icon || <MapPin className={`w-3.5 h-3.5 ${iconColorClass}`} />}
          <span>{label}</span>
        </label>
        {selectedStationObj && (
          <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
            {selectedStationObj.code} · {selectedStationObj.zone}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          disabled={disabled}
          autoComplete="off"
          placeholder={placeholder}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
            // If user cleared the input manually, notify parent
            if (!e.target.value) {
              onChange('');
            }
          }}
          onKeyDown={handleKeyDown}
          className={`w-full pl-3 pr-16 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white font-medium transition-all ${
            error
              ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
              : 'border-slate-200 focus:ring-blue-600 focus:border-blue-600'
          }`}
        />

        {/* Action icons on right: Clear button & dropdown chevron */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value || query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              title="Clear station"
              aria-label="Clear station selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}

          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setIsOpen(prev => !prev);
              if (!isOpen && inputRef.current) inputRef.current.focus();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Validation error message */}
      {error && (
        <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && !disabled && (
        <ul
          ref={dropdownRef}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white rounded-lg border border-slate-200 shadow-lg divide-y divide-slate-100 text-xs"
        >
          {filteredStations.length === 0 ? (
            <li className="p-3 text-center text-slate-500 text-xs">
              <p className="font-semibold text-slate-700">No railway stations found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Try searching by city name (e.g. &quot;Delhi&quot;, &quot;Kanpur&quot;) or code (e.g. &quot;NDLS&quot;, &quot;CNB&quot;)
              </p>
            </li>
          ) : (
            filteredStations.map((st, index) => {
              const isSelected = value.toUpperCase() === st.code.toUpperCase();
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={st.code}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelectStation(st)}
                  className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                    isHighlighted
                      ? 'bg-blue-50 text-blue-950'
                      : isSelected
                      ? 'bg-slate-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="shrink-0 font-mono text-xs font-bold px-2 py-1 bg-slate-900 text-white rounded tracking-wide">
                      {st.code}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{st.name}</span>
                        {st.category && (
                          <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                            {st.category}
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{st.city}, {st.state}</span>
                        <span>·</span>
                        <span className="text-slate-400">{st.zone}</span>
                        {st.division && (
                          <>
                            <span>·</span>
                            <span className="text-slate-400">{st.division} Div</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-semibold text-blue-900 bg-blue-100/60 px-1.5 py-0.5 rounded">
                    Select
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
