import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VendingMachineImg from "../assets/vending1.png";
import AddVendingMachine from "./AddVendingMachine";
import { LocationProvider } from "./SharedContext";
import { getMachine, VendingMachineRecord } from "../api/vendingMachine";
import "../css/MachineDetailPage.css";

interface MachineData {
  id: number;
  location: string;
  desc: string;
  available: boolean;
  itemsParsed: Array<{ name: string; available: boolean }>;
  imageUrl?: string;
}

const PLACEHOLDER_ITEMS: Array<{ name: string; available: boolean }> = [
  { name: "Cola", available: true },
  { name: "Chips", available: false },
  { name: "Water", available: true },
  { name: "Gum", available: false },
  { name: "Energy Bar", available: true },
];

const MachineDetailPage: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate     = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [machineRec, setMachineRec] = useState<VendingMachineRecord|null>(null);
  const [rawData, setRawData]   = useState<VendingMachineRecord | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Fetch the vending machine record
  useEffect(() => {
    (async () => {
      if (!machineId) {
        setError("Invalid ID");
        setLoading(false);
        return;
      }
      const idNum = parseInt(machineId, 10);
      if (isNaN(idNum)) {
        setError("Invalid ID");
        setLoading(false);
        return;
      }

      try {
        const data = await getMachine(idNum);
        setRawData(data);
      } catch {
        setError("Could not load machine details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [machineId]);

  const machine: MachineData | null = useMemo(() => {
    if (!rawData) return null;

    let itemsParsed: Array<{ name: string; available: boolean }>;

    try {
      const parsed = JSON.parse(rawData.items);
      // Case 1: array of objects [{ name, available }, …]
      if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "object") {
        itemsParsed = (parsed as any[]).map((it) => ({
          name: (it as any).name,
          available: (it as any).available,
        }));
      }
      // Case 2: array of strings → mark each available = true
      else if (Array.isArray(parsed)) {
        itemsParsed = (parsed as string[]).map((name) => ({
          name,
          available: true,
        }));
      }
      // Otherwise, fallback
      else {
        itemsParsed = PLACEHOLDER_ITEMS;
      }
    } catch {
      // JSON.parse failed → show placeholder items
      itemsParsed = PLACEHOLDER_ITEMS;
    }

    return {
      id: rawData.id,
      location: rawData.location,
      desc: rawData.desc,
      available: rawData.available,
      rating: rawData.rating ?? 0,
      reviewsCount: rawData.reviewsCount ?? 0,
      itemsParsed,
      imageUrl: rawData.imageUrl || "",
    };
  }, [rawData]);

  useEffect(() => { setMachineRec(rawData); }, [rawData]);


  // Render loading / error / not-found states
  if (loading)   return <div className="md-loading">Loading…</div>;
  if (error)     return <div className="md-error">{error}</div>;
  if (!machine)  return <div className="md-empty">No machine found.</div>;

  // Final JSX: refer to `machine.*` directly
  return (
      <div className="machine-detail-page">
        <div className="back-wrapper">
          <button className="md-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <div className="md-card-wrapper">
          <div className="md-card">
            <header className="md-header">
              <h1>{machine.location}</h1>
              <span
                  className={
                    machine.available
                        ? "md-badge available"
                        : "md-badge unavailable"
                  }
              >
              {machine.available ? "Available" : "Unavailable"}
            </span>
            </header>

            <div className="md-content">
              <div className="md-image">
                <img
                    src={machine.imageUrl ? machine.imageUrl : (VendingMachineImg as unknown as string)}
                    alt={machine.desc}
                />
              </div>

              <div className="md-info">
                <p className="md-desc">{machine.desc}</p>

                <section className="md-items">
                  <h2>Items</h2>
                  <ul>
                    {machine.itemsParsed.map((it, idx) => (
                        <li
                            key={idx}
                            className={
                              it.available ? "item-available" : "item-unavailable"
                            }
                        >
                          {it.available ? <CheckCircleIcon /> : <CancelIcon />}
                          <span>{it.name}</span>
                        </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
            {machineRec && (
                <button
                    className="md-edit-btn"
                    onClick={() => setEditOpen(true)}
                >
                  Edit
                </button>
            )}
            {editOpen && machineRec && (
              <div className="avm-modal">
                <LocationProvider>
                  <AddVendingMachine
                      isOpen={editOpen}
                      initialData={machineRec!}
                      onClose={() => setEditOpen(false)}
                      onSaved={(updated) => {
                        // refresh the page state:
                        setRawData(updated);
                        setEditOpen(false);
                      }}
                  />
                </LocationProvider>
              </div>
            )}
            <div className="md-legend">
              <div>
                <CheckCircleIcon className="icon-available" /> Available
              </div>
              <div>
                <CancelIcon className="icon-unavailable" /> Out of stock
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MachineDetailPage;
