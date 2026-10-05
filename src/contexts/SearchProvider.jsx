import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useDebouncedValue } from "../hooks/useDebounce";
import { useSearchParams, useLocation } from "react-router-dom";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const location = useLocation();

  // Reset search term when navigating to a new page without a search param
  useEffect(() => {
    if (!urlSearch) {
      setSearchTerm("");
    }
  }, [location.pathname, urlSearch]);

  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 750);

  // Memoize so consumers that only care about debouncedSearchTerm don't
  // re-render on every keystroke-triggered provider re-render.
  const value = useMemo(
    () => ({ searchTerm, setSearchTerm, debouncedSearchTerm }),
    [searchTerm, debouncedSearchTerm]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export const useGlobalSearch = () => useContext(SearchContext);
