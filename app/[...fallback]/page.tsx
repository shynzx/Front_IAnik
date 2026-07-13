import { redirect } from "next/navigation";

// Limpia cualquier ruta inexistente y devuelve al usuario al punto de entrada.
export default function FallbackPage() {
  redirect("/");
}
