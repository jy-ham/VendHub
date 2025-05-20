import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import "../css/MultiMachineCard.css";
import { VendingMachine } from "../@types/VendingMachine";

interface MultiMachineCardProps {
  machines: VendingMachine[];
  onClose?: () => void;
}

const MultiMachineCard: React.FC<MultiMachineCardProps> = ({
  machines,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleDetailsClick = (machineId: number) => {
    // close the MultiMachineCard overlay, then navigate
    if (onClose) onClose();
    navigate(`/machines/${machineId}`);
  };

  return (
    <div className="multi-machine-card">
      <div className="close-tag">
        <button className="multi-machine-card__close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div>
        <div className="multi-machine-card__content">
          {machines.map((machine) => (
            <div key={machine.id} className={"multi-machine-card__row"}>
              <div style={{ width: "10%" }}>
                <span
                  className="multi-machine-card__status-indicator"
                  style={{
                    backgroundColor: machine.available ? "green" : "red",
                  }}
                />
              </div>
              <div style={{ width: "60%" }}>
                <div className="multi-machine-card__info">
                  <p className="multi-machine-card__location">
                    {machine.location}
                  </p>
                  <p className="multi-machine-card__description">
                    {machine.desc}
                  </p>
                </div>
              </div>
              <div style={{ width: "30%" }}>
                {" "}
                {/* MUI Button to go to detail page */}
                <Button
                  variant="contained"
                  size="small"
                  sx={{ marginLeft: "auto" }}
                  onClick={() => handleDetailsClick(machine.id)}
                >
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiMachineCard;
