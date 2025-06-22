import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

export type SearchBarProps = {
  placeholder?: string;
  onSearch: (term: string) => void;
  initialValue?: string;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  initialValue = "",
}) => {
  const [term, setTerm] = useState(initialValue);

  useEffect(() => {
    setTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(term.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [term, onSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {term && (
        <button
          aria-label="Clear search"
          onClick={() => setTerm("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
