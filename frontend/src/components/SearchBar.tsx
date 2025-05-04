import '../CSS/SearchBar.css';
import { useEffect, useState } from 'react';

interface SearchBarProps {
    onSearch: (location: { lat: number; lng: number }) => void;
    dismissSuggestions: boolean;
    setDismissSuggestions: (val: boolean) => void;
}

const BCIT_BUILDINGS = [
    { name: "SW1", lat: 49.250951, lng: -123.002089 },
    { name: "SW3", lat: 49.2500523, lng: -123.003196 },
    { name: "NE2", lat: 49.2533603, lng: -123.0008343 },
    // Add more buildings here...
];


const SearchBar = ({ onSearch, dismissSuggestions, setDismissSuggestions }: SearchBarProps) => {
    const [input, setInput] = useState('');
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
        const filtered = BCIT_BUILDINGS.filter(b =>
          b.name.toLowerCase().startsWith(value.toLowerCase())
        );
        setSuggestions(filtered);
      };
    
    const handleSelect = (building: typeof BCIT_BUILDINGS[number]) => {
       setInput(building.name);
       setSuggestions([]);
       onSearch({ lat: building.lat, lng: building.lng });
     };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const match = BCIT_BUILDINGS.find(b => b.name.toLowerCase() === input.trim().toLowerCase());
        if (match) {
            onSearch({ lat: match.lat, lng: match.lng });
        } else {
            alert("Building not found.");
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-form">
                <div className = "input-container">
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
                                <li key={i} onClick={() => handleSelect(b)}>{b.name}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SearchBar;
