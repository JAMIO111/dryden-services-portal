import { createContext, useContext, useState, useEffect } from "react";
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

  return (
    <SearchContext.Provider
      value={{ searchTerm, setSearchTerm, debouncedSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useGlobalSearch = () => useContext(SearchContext);
