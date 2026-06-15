import { useState, useRef } from "react";
import { geocodeAddress, type GeoResult } from "@shared/utils/geocode";

export function useAddressSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await geocodeAddress(query);
      setSearchResults(results);
      setSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return { searchQuery, searchResults, searching, handleSearch, clearSearch };
}
