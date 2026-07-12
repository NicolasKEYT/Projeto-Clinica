import { useToast } from '../ui'

export default function ConfiguracoesView() {
  const { show } = useToast()

  return (
    <section className="view-section">
      <header>
        <div className="header-title">
          <h1>Configurações da Clínica</h1>
          <p>Políticas de retenção e logs</p>
        </div>
      </header>

      <div className="metrics-grid">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <span className="card-title">Retenção de Prontuários (LGPD)</span>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '10px 0' }}>
            Configuração de expiração de dados no Supabase.
          </p>
          <select className="input-field" style={{ width: 220 }} defaultValue="20">
            <option value="20">20 Anos (Padrão CFM)</option>
            <option value="ind">Indeterminado</option>
          </select>
        </div>
        <div className="card">
          <span className="card-title">Auditoria</span>
          <p style={{ fontSize: 13, color: '#4CAF50', margin: '10px 0' }}>
            Triggers de imutabilidade ativos
          </p>
          <button className="btn" onClick={() => show('Baixando logs em CSV...')}>
            Exportar Logs
          </button>
        </div>
      </div>
    </section>
  )
}
