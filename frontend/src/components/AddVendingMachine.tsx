import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "../css/AddVendingMachine.css";
import { useLocation } from "./SharedContext";
import { FaRegSave, FaMapMarkerAlt } from "react-icons/fa";
import { BCIT_BUILDINGS } from "../data/BCIT_BUILDINGS";

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
};

const AddVendingMachine: React.FC<Props> = ({ onClose, isOpen }) => {
  const { getCurrentLocation, locationPermissions } = useLocation();

  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [itemInput, setItemInput] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [available, setAvailable] = useState(true);
  const [position, setPosition] = useState<Location>();
  const [loadingPosition, setLoadingPosition] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocation("");
      setDescription("");
      setPhoto(null);
      setPhotoPreview(null);
      setItemInput("");
      setItems([]);
      setAvailable(true);
      handlePosition();
    }
  }, [isOpen]);

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
    if (locationPermissions === "denied") {
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
      description,
      photo,
      available,
      items,
    });

    const formData = new FormData();
    formData.append("location", location);
    formData.append("desc", description);
    formData.append("available", available ? "true" : "false");
    if (position) {
      formData.append("lat", position.lat.toString());
      formData.append("lon", position.lng.toString());
    }

    if (photo instanceof File) {
      formData.append("image", photo);
    }

    formData.append("items", JSON.stringify(items));

    try {
      const response = await fetch("/api/vending-machine", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // TODO: Error logic
        throw new Error("Failed to upload");
      }
      console.log("Successfully uploaded");
    } catch (error) {
      console.log("Upload error", error);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="add-vending-machine-card">
      <div className="add-vending-machine-top-row">
        <label className="switch" title="Toggle vending machine availability">
          <input
            type="checkbox"
            checked={available}
            onChange={() => setAvailable(!available)}
          />
          <span className="slider"></span>
        </label>
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
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="add-vending-machine-input"
      />

      <div className="add-vending-machine-location">
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">-- Choose a building --</option>
          {BCIT_BUILDINGS.map((building) => (
            <option key={building.name}>
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
              <label className="switch">
                <input
                  type="checkbox"
                  checked={item.available}
                  onChange={() => toggleItem(index)}
                />
                <span className="slider round"></span>
              </label>
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
