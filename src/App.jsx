import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './components/ui'
import RootLayout from './components/RootLayout'
import PatientLayout from './components/PatientLayout'
import DoctorLayout from './components/DoctorLayout'

import InicioView from './components/patient/InicioView'
import AgendarView from './components/patient/AgendarView'
import HistoricoView from './components/patient/HistoricoView'
import FotosView from './components/patient/FotosView'

import DashboardView from './components/doctor/DashboardView'
import ProcedimentosView from './components/doctor/ProcedimentosView'
import PacientesView from './components/doctor/PacientesView'
import ConfiguracoesView from './components/doctor/ConfiguracoesView'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Navigate to="/paciente" replace />} />

            <Route path="paciente" element={<PatientLayout />}>
              <Route index element={<InicioView />} />
              <Route path="agendar" element={<AgendarView />} />
              <Route path="historico" element={<HistoricoView />} />
              <Route path="fotos" element={<FotosView />} />
            </Route>

            <Route path="doutor" element={<DoctorLayout />}>
              <Route index element={<DashboardView />} />
              <Route path="procedimentos" element={<ProcedimentosView />} />
              <Route path="pacientes" element={<PacientesView />} />
              <Route path="configuracoes" element={<ConfiguracoesView />} />
            </Route>

            <Route path="*" element={<Navigate to="/paciente" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
