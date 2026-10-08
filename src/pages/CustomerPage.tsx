import { Header } from '../components/Header'

// Panel del cliente. En la Etapa 3 aquí van sus medidas y el catálogo.
export function CustomerPage() {
  return (
    <>
      <Header title="Mi espacio" />
      <main className="page">
        <div className="card">
          <h2>¡Hola! 👋</h2>
          <p>Entraste como <strong>cliente</strong>. Pronto vas a cargar tus medidas y ver qué prendas te quedan.</p>
        </div>
      </main>
    </>
  )
}
