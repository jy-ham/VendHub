import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import '../css/AddVendingMachine.css';

interface Item {
  name: string;
  enabled: boolean;
}

interface Props {
  onClose: () => void;
  isOpen: boolean;
}

const AddVendingMachine: React.FC<Props> = ({ onClose, isOpen }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [itemInput, setItemInput] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
  if (isOpen) {
    setName('');
    setDescription('');
    setPhoto(null);
    setPhotoPreview(null);
    setItemInput('');
    setItems([]);
    setEnabled(true);
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
      setItems([...items, { name: itemInput.trim(), enabled: true }]);
      setItemInput('');
    }
  };

  const toggleItem = (index: number) => {
    const updated = [...items];
    updated[index].enabled = !updated[index].enabled;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: handle uploading data to the server
    console.log({ name, description, photo, enabled, items });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="add-vending-machine-card">
      <div className="add-vending-machine-top-row">
        <label className="switch">
          <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} />
          <span className="slider"></span>
        </label>
        <button type="submit" className="add-vending-machine-save-button">💾</button>
        <button type="button" onClick={onClose} className="add-vending-machine-close-button">&times;</button>
      </div>

      <div className="add-vending-machine-image-upload">
        {photoPreview ? (
          <img src={photoPreview} alt="Preview" className="add-vending-machine-preview-image" />
        ) : (
          <label htmlFor="upload-photo" className="add-vending-machine-placeholder">
            <input
              type="file"
              id="upload-photo"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <span className="add-vending-machine-placeholder-plus">+</span>
          </label>
        )}
      </div>

      <input
        type="text"
        placeholder="Enter name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="add-vending-machine-input"
      />

      <input
        placeholder="Where it is..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
                  checked={item.enabled}
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