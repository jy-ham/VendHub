import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "../css/AddVendingMachine.css";
import { useLocation } from "./SharedContext";
import { FaRegSave, FaMapMarkerAlt } from "react-icons/fa";
import { BCIT_BUILDINGS } from "../data/BCIT_BUILDINGS";
import {VendingMachineRecord, patchMachineItems, getMachine} from '../api/vendingMachine';


interface Item {
  name: string;
  available: boolean;
}

interface Props {
  onClose: () => void;
  isOpen: boolean;
  /** initialData = editing; if absent, it’s a “create” */
  initialData?: VendingMachineRecord;
  // setMachines: React.Dispatch<React.SetStateAction<VendingMachine[]>>;
  /** callback to refresh parent list */
  onSaved: (machine: VendingMachineRecord) => void;
}

type Location = {
  lat: number;
  lng: number;
};

const AddVendingMachine: React.FC<Props> = ({ onClose, isOpen, initialData, onSaved }) => {
  const { getCurrentLocation, locationPermissions } = useLocation();

  const [location, setLocation] = useState(initialData?.location || '');
  const [desc, setDesc] = useState(initialData?.desc || '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [itemInput, setItemInput] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [position, setPosition] = useState<Location>();
  const [loadingPosition, setLoadingPosition] = useState(false);

  // On open, if initialData provided, parse its items JSON
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData.items);
        if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === 'object') {
          setItems((parsed as any[]).map(it => ({
            name: it.name,
            available: it.available,
          })));
        } else if (Array.isArray(parsed)) {
          setItems((parsed as string[]).map(name => ({
            name, available: true,
          })));
        }
      } catch {
        setItems([]);
      }
    } else {
      // new form
      setLocation('');
      setDesc('');
      setAvailable(true);
      setItems([]);
      // acquire current coords
      getCurrentLocation()
          .then(pos => setPosition({ lat: pos.lat, lng: pos.lng }))
          .catch(() => {});
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photo]);

  const handlePosition = async () => {
    if (!initialData && locationPermissions === "denied") {
      console.log(locationPermissions);
      alert(
        "You've denied location access. Please enable it in your browser settings. Adding a new vending machine requires your current location"
      );
      onClose();
      return;
    }

    setLoadingPosition(true);

    try {
      const pos = await getCurrentLocation();
      console.log("Current position:", pos.lat, pos.lng);
      setPosition({ lat: pos.lat, lng: pos.lng });
    } catch (e) {
      console.log("Failed to get current location:", e);
    } finally {
      setLoadingPosition(false);
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
  };

  const handleAddItem = () => {
    if (itemInput.trim()) {
      setItems([...items, { name: itemInput.trim(), available: true }]);
      setItemInput("");
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

    console.log("Uploading: ", {
      location,
      position,
      desc,
      photo,
      available,
      items,
    });

    if (!desc) {
      alert("Please enter a name");
      return;
    }
    
    if (!initialData && !location) {
      alert("Please select a building.");
      return;
    }

    const formData = new FormData();
    formData.append("location", location);
    formData.append("desc", desc);
    formData.append("available", available ? "true" : "false");
    if (!initialData) {
      if (!position) {
        alert(
            "Error getting your location—please enable location access and try again."
        );
        return;
      }
      formData.append("lat", position.lat.toString());
      formData.append("lon", position.lng.toString());
    }

    if (photo instanceof File) {
      formData.append("image", photo);
    }

    formData.append("items", JSON.stringify(items));

    try {
      const token = localStorage.getItem("authToken");
      let saved: VendingMachineRecord;
      if (initialData) {
        // EDIT existing
        await patchMachineItems(initialData.id, items, available);
        saved = await getMachine(initialData.id);
      } else {
        // CREATE new
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/vending-machine`, {
          method: 'POST', 
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData,
        });
        saved = await res.json();
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  if (!isOpen) return null;
  return (
    <form onSubmit={handleSubmit} className="add-vending-machine-card">
      <div className="add-vending-machine-top-row">
          <button
            type="button"
            onClick={() => setAvailable(!available)}
            className={`avail-button ${available ? `is-available` : `is-unavailable`}`}
          >
            {available ? 'Available' : 'Unavailable'}
          </button>
        <button
          type="button"
          onClick={handlePosition}
          className="add-vending-machine-buttons"
          title="Get current location"
          disabled={loadingPosition}
        >
          <FaMapMarkerAlt />
        </button>
        <button
          type="submit"
          className="add-vending-machine-buttons"
          title="Add new vending machine"
        >
          <FaRegSave />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="add-vending-machine-close-button"
        >
          &times;
        </button>
      </div>

      <div className="add-vending-machine-image-upload">
        <label
          htmlFor="upload-photo"
          className="add-vending-machine-placeholder"
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="add-vending-machine-preview-image"
            />
          ) : (
            <span className="add-vending-machine-placeholder-plus">+</span>
          )}
          <input
            type="file"
            id="upload-photo"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <input
        type="text"
        placeholder="Name"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="add-vending-machine-input"
      />

      <div className="add-vending-machine-location">
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required={!initialData}
        >
          <option value="" disabled>-- Choose a building --</option>
          {BCIT_BUILDINGS.map((building) => (
            <option key={building.name} value={building.name}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      <div className="add-vending-machine-item-input-row">
        <input
          type="text"
          placeholder="Add new item..."
          value={itemInput}
          onChange={(e) => setItemInput(e.target.value)}
          className="add-vending-machine-input"
        />
        <button
          type="button"
          onClick={handleAddItem}
          className="add-vending-machine-add-item-button"
        >
          +
        </button>
      </div>

      <ul className="add-vending-machine-item-list">
        {items.map((item, index) => (
          <li key={index} className="add-vending-machine-item-row">
            <span className="vending-machine-item-name">{item.name}</span>
            <div className="vending-machine-item-controls">
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className={`avail-button ${item.available ? `is-available` : `is-unavailable`}`}
              >
                {item.available ? 'Available' : 'Unavailable'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="add-vending-machine-remove-button"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </form>
  );
};

export default AddVendingMachine;
