import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Modal from "@/components/ui/Modal";

describe("Modal", () => {
  it("expone semántica accesible y cierra con Escape", () => {
    const onClose = vi.fn();
    render(<Modal title="Crear cuaderno" onClose={onClose}><div className="modal-body"><button>Guardar</button></div></Modal>);
    expect(screen.getByRole("dialog", { name: "Crear cuaderno" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
