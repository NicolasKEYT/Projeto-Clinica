import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui'
import RootLayout from './components/RootLayout'
import AuthLoading from './components/auth/AuthLoading'
import LoginPage from './components/auth/LoginPage'
import SignupPage from './components/auth/SignupPage'
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

function homeFor(role) {
  return role === 'doctor' ? '/doutor' : '/paciente'
}

// Exige login e o papel certo. Redireciona quem não tem acesso.
function RequireRole({ required, children }) {
  const { user, role, loading } = useAuth()
  if (loading) return <AuthLoading />
  if (!user || !role) return <Navigate to="/login" replace />
  if (role !== required) return <Navigate to={homeFor(role)} replace />
  return children
}

// Para login/cadastro: se já estiver logado, manda pra área certa.
function RedirectIfAuthed({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return <AuthLoading />
  if (user && role) return <Navigate to={homeFor(role)} replace />
  return children
}

function HomeRedirect() {
  const { user, role, loading } = useAuth()
  if (loading) return <AuthLoading />
  if (user && role) return <Navigate to={homeFor(role)} replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<HomeRedirect />} />

              <Route path="login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
              <Route path="cadastro" element={<RedirectIfAuthed><SignupPage /></RedirectIfAuthed>} />

              <Route
                path="paciente"
                element={
                  <RequireRole required="patient">
                    <PatientLayout />
                  </RequireRole>
                }
              >
                <Route index element={<InicioView />} />
                <Route path="agendar" element={<AgendarView />} />
                <Route path="historico" element={<HistoricoView />} />
                <Route path="fotos" element={<FotosView />} />
              </Route>

              <Route
                path="doutor"
                element={
                  <RequireRole required="doctor">
                    <DoctorLayout />
                  </RequireRole>
                }
              >
                <Route index element={<DashboardView />} />
                <Route path="procedimentos" element={<ProcedimentosView />} />
                <Route path="pacientes" element={<PacientesView />} />
                <Route path="configuracoes" element={<ConfiguracoesView />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
