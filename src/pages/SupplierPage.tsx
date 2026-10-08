import { Header } from '../components/Header'

// Panel del proveedor. En la Etapa 4 aquí va la gestión de prendas.
export function SupplierPage() {
  return (
    <>
      <Header title="Panel de proveedor" />
      <main className="page">
        <div className="card">
          <h2>¡Hola! 👋</h2>
          <p>Entraste como <strong>proveedor</strong>. Pronto vas a poder subir tus prendas con sus medidas.</p>
        </div>
      </main>
    </>
  )
}
