import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import VendingMachineImg from "../assets/vending1.png";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import "../css/MachineDetailPage.css";

interface MachineData {
  id: number;
  location: string;
  desc: string;
  available: boolean;
  rating?: number;
  reviewsCount?: number;
  items?: Array<string> | Array<{ name: string; available: boolean }>;
  coverImageURL?: string;
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
  const navigate = useNavigate();

  const [machine, setMachine] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<MachineData>(
          `/api/vending-machine/${machineId}`
        );
        setMachine(res.data);
      } catch {
        setError("Could not load machine details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [machineId]);

  const itemsList = useMemo(() => {
    if (
      !machine?.items ||
      (Array.isArray(machine.items) && machine.items.length === 0)
    ) {
      return PLACEHOLDER_ITEMS;
    }
    if (Array.isArray(machine.items) && typeof machine.items[0] === "object") {
      return (machine.items as any[]).map((it) => ({
        name: (it as any).name,
        available: (it as any).available,
      }));
    }
    if (Array.isArray(machine.items)) {
      return (machine.items as string[]).map((name) => ({
        name,
        available: true,
      }));
    }
    return PLACEHOLDER_ITEMS;
  }, [machine?.items]);

  if (loading) return <div className="md-loading">Loading…</div>;
  if (error) return <div className="md-error">{error}</div>;
  if (!machine) return <div className="md-empty">No machine found.</div>;

  return (
    <div className="machine-detail-page">
      <button className="md-back" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="md-card">
        <header className="md-header">
          <h1>{machine.location}</h1>
          <span
            className={
              machine.available ? "md-badge available" : "md-badge unavailable"
            }
          >
            {machine.available ? "Available" : "Unavailable"}
          </span>
        </header>

        <div className="md-content">
          <div className="md-image">
            <img
              src={
                machine.coverImageURL
                  ? `https://admin.chtp.com/files/${machine.coverImageURL}`
                  : VendingMachineImg
              }
              alt={machine.desc}
            />
          </div>

          <div className="md-info">
            <p className="md-desc">{machine.desc}</p>
            <div className="md-meta">
              <div>
                Rating: <strong>{machine.rating ?? 0}/5</strong>
              </div>
              <div>
                Reviews: <strong>{machine.reviewsCount ?? 0}</strong>
              </div>
              <div>
                ID: <strong>{machine.id}</strong>
              </div>
            </div>

            <section className="md-items">
              <h2>Items</h2>
              <ul>
                {itemsList.map((it, idx) => (
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
  );
};

export default MachineDetailPage;
