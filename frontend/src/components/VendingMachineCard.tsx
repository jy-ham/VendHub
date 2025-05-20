import React, { useState } from "react";
import "../css/VendingMachineCard.css";
import vendingMachine from "../assets/vending1.png";
import Coke from "../assets/coke.png";
import Snickers from "../assets/snickers.png";
interface VendingMachineCardProps {
  title: string;
  items: string[];
  onClose?: () => void;
}

const VendingMachineCard: React.FC<VendingMachineCardProps> = ({
  title,
  items,
}) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  return (
    <div
      className="card-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* The “upper” portion */}
      <div className={`upper-card ${hovered ? "show" : ""}`}>
        <div className="upper-card-section">
          <img src={Coke} alt="icon" />
          <p className="text-md weight-semi-bold">{title}</p>
        </div>
      </div>

      {/* The “center” portion */}
      <div className={`center-card ${hovered ? "hovering" : ""}`}>
        <img src={vendingMachine} alt="machine" />
        <div className="info-column">
          <p className="text-sm">Click or Hover for details</p>
        </div>
      </div>

      {/* The “lower” portion */}
      <div className={`lower-card ${hovered ? "show" : ""}`}>
        <div className="lower-card-list">
          {items.map((item, index) => (
            <div key={index} className="lower-card-row">
              <img src={Snickers} alt="Snickers" />
              <p className="text-sm">{item}</p>
            </div>
          ))}
          {/* <div className="lower-card-section">
                        <img src={Snickers} alt="Icon" />
                        <p className="text-sm">{items.length} items</p>
                    </div> */}
        </div>

        {/* The footer */}
        <div className="lower-card-footer bg-green">
          <p className="text-sm">All systems go</p>
        </div>
      </div>
    </div>
  );
};

export default VendingMachineCard;
