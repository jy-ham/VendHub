import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import '../css/AddVendingMachine.css';
import { useLocation } from './SharedContext';

interface Item {
  name: string;
  available: boolean;
}

interface Props {
  onClose: () => void;
  isOpen: boolean;
}

type Location = {
  lat: number;
  lng: number;
}

const AddVendingMachine: React.FC<Props> = ({ onClose, isOpen }) => {
  const { getCurrentLocation } = useLocation();

  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [itemInput, setItemInput] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLocation('');
      setDescription('');
      setPhoto(null);
      setPhotoPreview(null);
      setItemInput('');
      setItems([]);
      setAvailable(true);
    }
  }, [isOpen]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddItem = () => {
    if (itemInput.trim()) {
      setItems([...items, { name: itemInput.trim(), available: true }]);
      setItemInput('');
    }
  };

  const toggleItem = (index: number) => {
    const updated = [...items];
    updated[index].available = !updated[index].available;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let position: Location | null = null;

    try {
      position = await getCurrentLocation();
      console.log("Current position:", position.lat, position.lng);
    } catch (e) {
      console.log("Failed to get current location:", e);
    };

    console.log("Uploading: ", { position, description, photo, available, items });
    
    const formData = new FormData();
    formData.append('location', location);
    formData.append('desc', description);
    formData.append('available', available ? 'true' : 'false');
    if (position) {
      formData.append('lat', position.lat.toString());
      formData.append('lon', position.lng.toString());
    }
    
    if (photo instanceof File) {
      formData.append('image', photo);
    }

    formData.append('items', JSON.stringify(items));

    try {
      const response = await fetch('/api/vending-machine', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        // TODO: Error logic
        throw new Error('Failed to upload');
      }
      console.log('Successfully uploaded');
    } catch (error) {
      console.log('Upload error', error);
    }

    onClose();    
  };

  return (
    <form onSubmit={handleSubmit} className="add-vending-machine-card">
      <div className="add-vending-machine-top-row">
        <label className="switch">
          <input type="checkbox" checked={available} onChange={() => setAvailable(!available)} />
          <span className="slider"></span>
        </label>
        <button type="submit" className="add-vending-machine-save-button">💾</button>
        <button type="button" onClick={onClose} className="add-vending-machine-close-button">&times;</button>
      </div>

      <div className="add-vending-machine-image-upload">
        <label htmlFor="upload-photo" className="add-vending-machine-placeholder">
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="add-vending-machine-preview-image" />
          ) : (
            <span className="add-vending-machine-placeholder-plus">+</span>
          )}
          <input
            type="file"
            id="upload-photo"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <input
        type="text"
        placeholder="Name"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="add-vending-machine-input"
      />

      <input
        type="text"
        placeholder="Where it is..."
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="add-vending-machine-input"
      />

      <div className="add-vending-machine-item-input-row">
        <input
          type="text"
          placeholder="Add new item..."
          value={itemInput}
          onChange={(e) => setItemInput(e.target.value)}
          className="add-vending-machine-input"
        />
        <button type="button" onClick={handleAddItem} className="add-vending-machine-add-item-button">+</button>
      </div>

      <ul className="add-vending-machine-item-list">
        {items.map((item, index) => (
          <li key={index} className="add-vending-machine-item-row">
            <span className="vending-machine-item-name">{item.name}</span>
            <div className="vending-machine-item-controls">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={item.available}
                  onChange={() => toggleItem(index)}
                />
              <span className="slider round"></span>
              </label>

            </div>
            <button type="button" onClick={() => removeItem(index)} className="add-vending-machine-remove-button">×</button>
          </li>
        ))}
      </ul>
    </form>
  );
};

export default AddVendingMachine;