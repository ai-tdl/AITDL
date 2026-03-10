// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Component: Intelligent Location Selector
// Features: Autocomplete, State-City Dependency, Glassmorphic UI

"use client";

import { useState, useEffect, useRef } from "react";
import { INDIA_LOCATIONS, IndiaState } from "@/lib/data/india-locations";

interface LocationSelectorProps {
  onLocationChange: (state: string, city: string) => void;
  initialState?: string;
  initialCity?: string;
  theme?: "violet" | "emerald";
}

export default function LocationSelector({ 
  onLocationChange, 
  initialState = "", 
  initialCity = "",
  theme = "violet"
}: LocationSelectorProps) {
  const [selectedState, setSelectedState] = useState(initialState);
  const [cityInput, setCityInput] = useState(initialCity);
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  
  const cityRef = useRef<HTMLDivElement>(null);

  // Focus effect for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update cities when state changes
  useEffect(() => {
    const stateData = INDIA_LOCATIONS.find(s => s.state === selectedState);
    if (stateData) {
      const filtered = stateData.districts.filter(d => 
        d.toLowerCase().includes(cityInput.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
    onLocationChange(selectedState, cityInput);
  }, [selectedState, cityInput, onLocationChange]);

  const accentClass = theme === "violet" ? "border-violet-500/50 ring-violet-500/10" : "border-emerald-500/50 ring-emerald-500/10";
  const bgAccent = theme === "violet" ? "bg-violet-600/20" : "bg-emerald-600/20";
  const hoverAccent = theme === "violet" ? "hover:bg-violet-500/20" : "hover:bg-emerald-500/20";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* State Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs text-zinc-400 uppercase tracking-widest">State *</label>
        <select 
          name="state"
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setCityInput(""); // Reset city when state changes
          }}
          required
          className="form-input"
        >
          <option value="" className="bg-zinc-900">Select State</option>
          {INDIA_LOCATIONS.map(s => (
            <option key={s.state} value={s.state} className="bg-zinc-900">{s.state}</option>
          ))}
        </select>
      </div>

      {/* City Autocomplete */}
      <div className="space-y-1.5 relative" ref={cityRef}>
        <label className="block text-xs text-zinc-400 uppercase tracking-widest">City / District *</label>
        <input 
          type="text"
          name="city"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onFocus={() => setIsCityFocused(true)}
          required
          disabled={!selectedState}
          placeholder={selectedState ? "Type or select city..." : "Select state first"}
          className={`form-input ${isCityFocused && selectedState ? accentClass + " ring-4" : ""}`}
          autoComplete="off"
        />

        {/* Dropdown */}
        {isCityFocused && selectedState && filteredCities.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 z-50 glass rounded-xl border border-white/10 overflow-hidden shadow-2xl animate-fade-in max-h-60 overflow-y-auto custom-scrollbar">
            {filteredCities.map(city => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setCityInput(city);
                  setIsCityFocused(false);
                }}
                className={`w-full text-left px-5 py-3 text-sm text-zinc-300 transition-colors ${hoverAccent} active:bg-white/10`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
