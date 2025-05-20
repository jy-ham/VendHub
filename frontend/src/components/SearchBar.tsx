import "../css/SearchBar.css";
import { BCIT_BUILDINGS } from "../data/BCIT_BUILDINGS";
import { useEffect, useState } from "react";
import AddButton from "./AddButton";

interface SearchBarProps {
  onSearch: (location: { lat: number; lng: number }) => void;
  dismissSuggestions: boolean;
  setDismissSuggestions: (val: boolean) => void;
  setShowAuth: (val: boolean) => void;
}

const SearchBar = ({
  onSearch,
  dismissSuggestions,
  setDismissSuggestions,
  setShowAuth,
}: SearchBarProps) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<typeof BCIT_BUILDINGS>([]);
  useEffect(() => {
    if (dismissSuggestions) {
      setSuggestions([]);
      setDismissSuggestions(false);
    }
  }, [dismissSuggestions, setDismissSuggestions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    const filtered = BCIT_BUILDINGS.filter((b) =>
      b.name.toLowerCase().startsWith(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSelect = (building: (typeof BCIT_BUILDINGS)[number]) => {
    setInput(building.name);
    setSuggestions([]);
    onSearch({ lat: building.lat, lng: building.lng });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = BCIT_BUILDINGS.find(
      (b) => b.name.toLowerCase() === input.trim().toLowerCase()
    );
    if (match) {
      onSearch({ lat: match.lat, lng: match.lng });
    } else {
      alert("Building not found.");
    }
  };

  return (
    <div className="search-container">
      {/* Add Button (top-left corner) */}
      <div style={{ width: "20%" }}>
        <AddButton />
      </div>
      <div style={{ width: "60%" }}>
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-container">
            <input
              className="search-input"
              type="text"
              placeholder="Search...(e.g., SW1)"
              value={input}
              onChange={handleChange}
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((b, i) => (
                  <li key={i} onClick={() => handleSelect(b)}>
                    {b.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
      </div>
      <div style={{ width: "20%" }}>
        {/* Top-right Login Button */}
        <button className="login-button" onClick={() => setShowAuth(true)}>
          Login
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
