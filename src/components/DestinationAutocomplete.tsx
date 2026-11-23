import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { APIProviderContext, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Loader2 } from 'lucide-react';
import { checkAndDispatchMapsQuotaError } from '../utils/mapsQuota';

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string, kotaKabupaten?: string) => void;
  placeholder?: string;
}

function PlacesAutocompleteInput({ value, onChange, placeholder }: DestinationAutocompleteProps) {
  const placesLib = useMapsLibrary('places');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipNextFetchRef = useRef(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!placesLib || !isOpen) return;
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }
        setIsLoading(true);
        const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['id'],
          language: 'id',
        });
        setSuggestions(res.suggestions || []);
      } catch (err) {
        checkAndDispatchMapsQuotaError(err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [placesLib, value, isOpen]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!placesLib || !suggestion.placePrediction) return;
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['id', 'displayName', 'formattedAddress', 'addressComponents'],
        });
        const label =
          place.displayName && place.formattedAddress
            ? `${place.displayName}, ${place.formattedAddress}`
            : place.formattedAddress || place.displayName || suggestion.placePrediction.text.text;

        const cityComp =
          place.addressComponents?.find((c) => c.types.includes('administrative_area_level_2')) ||
          place.addressComponents?.find((c) => c.types.includes('locality'));
        const kotaKabupaten = cityComp?.longText || cityComp?.shortText || undefined;

        skipNextFetchRef.current = true;
        onChange(label, place.id, kotaKabupaten);
        setSuggestions([]);
        setIsOpen(false);
        sessionTokenRef.current = null;
      } catch (err) {
        checkAndDispatchMapsQuotaError(err);
        skipNextFetchRef.current = true;
        onChange(suggestion.placePrediction.text.text);
        setSuggestions([]);
        setIsOpen(false);
      }
    },
    [placesLib, onChange]
  );

  return (
    <div className="relative" ref={containerRef}>
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#0F8A5F]" /> : <MapPin className="w-4 h-4" />}
      </span>
      <input
        type="text"
        value={value}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setIsOpen(true);
          onChange(e.target.value, undefined);
        }}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
      />

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1.5 z-30 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
          {suggestions.map((suggestion, idx) => {
            const pred = suggestion.placePrediction;
            if (!pred) return null;
            return (
              <li key={pred.placeId || idx}>
                <button
                  type="button"
                  onClick={() => void handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#0F8A5F] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate">
                      {pred.mainText?.text || pred.text.text}
                    </p>
                    {pred.secondaryText?.text && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {pred.secondaryText.text}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function DestinationAutocomplete(props: DestinationAutocompleteProps) {
  const apiContext = useContext(APIProviderContext);

  if (!apiContext) {
    return (
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
          <MapPin className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value, undefined)}
          placeholder={props.placeholder}
          className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none focus:border-[#0F8A5F] text-neutral-800 dark:text-neutral-100"
        />
      </div>
    );
  }

  return <PlacesAutocompleteInput {...props} />;
}
