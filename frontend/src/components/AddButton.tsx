import React, { useRef, useState } from "react";
import AddVendingMachine from "./AddVendingMachine";
import { VendingMachine } from "../@types/VendingMachine";
import "../css/AddButton.css";

interface AddButtonProps {
  setMachines: React.Dispatch<React.SetStateAction<VendingMachine[]>>;
}

const AddButton: React.FC<AddButtonProps> = ({ setMachines }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = () => {
    setIsOpen(true);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    setIsOpen(false);
    dialogRef.current?.close();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (dialog && event.target === dialog) {
      closeDialog();
    }
  };

  return (
    <>
      <button className="add" onClick={openDialog}>
        +
      </button>

      <dialog ref={dialogRef} className="dialog" onClick={handleBackdropClick}>
        <AddVendingMachine setMachines={setMachines} onClose={closeDialog} isOpen={isOpen} />
      </dialog>
    </>
  );
};

export default AddButton;
