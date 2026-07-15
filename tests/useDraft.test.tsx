import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useDraft } from "@/hooks/useDraft";

describe("useDraft", () => {
  beforeEach(() => localStorage.clear());

  it("guarda y recupera el borrador por recurso", async () => {
    const { result } = renderHook(() => useDraft("chat:42"));
    await act(async () => { result.current.setValue("Mensaje pendiente"); });
    expect(localStorage.getItem("ianik:draft:chat:42")).toBe("Mensaje pendiente");
  });

  it("elimina el borrador al confirmar el envío", async () => {
    localStorage.setItem("ianik:draft:chat:42", "Mensaje");
    const { result } = renderHook(() => useDraft("chat:42"));
    await act(async () => { result.current.clear(); });
    expect(localStorage.getItem("ianik:draft:chat:42")).toBeNull();
  });
});
