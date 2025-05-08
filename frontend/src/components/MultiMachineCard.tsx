import React from 'react';
import { useState } from 'react';
import '../CSS/MultiMachineCard.css';
import { VendingMachine } from '../@types/VendingMachine';

interface MultiMachineCardProps {
    machines: VendingMachine[];
    onClose?: () => void;
}

const MultiMachineCard: React.FC<MultiMachineCardProps> = ({ machines, onClose }) => {
        
    return (
        <div className="multi-machine-card">
            <button className="multi-machine-card__close-btn" onClick={onClose}>
                ×
            </button>
            <div className="multi-machine-card__content">
                {machines.map(machine => (
                    <div
                        key={machine.id}
                        className={"multi-machine-card__row"}
                        onClick={() => {
                            
                        }}
                    >
                        <span
                            className="multi-machine-card__status-indicator"
                            style={{
                                backgroundColor: machine.available ? 'green' : 'red',
                            }}
                        />
                        <div className="multi-machine-card__info">
                            <p className="multi-machine-card__location">{machine.location}</p>
                            <p className="multi-machine-card__description">{machine.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MultiMachineCard;