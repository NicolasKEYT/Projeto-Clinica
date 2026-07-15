import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Descobre o papel do usuário: doutor ou paciente (ou nenhum).
async function loadProfile(userId) {
  if (!supabase) return { role: null, profile: null }
  const { data: doctor } = await supabase.from('doctors').select('*').eq('id', userId).maybeSingle()
  if (doctor) return { role: 'doctor', profile: doctor }
  const { data: patient } = await supabase.from('patients').select('*').eq('id', userId).maybeSingle()
  if (patient) return { role: 'patient', profile: patient }
  return { role: null, profile: null }
}

const NO_SUPABASE = {
  error: { message: 'Supabase não configurado. Preencha o arquivo .env com as chaves do projeto.' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let mounted = true

    function applySession(session) {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        loadProfile(u.id).then((r) => {
          if (!mounted) return
          setRole(r.role)
          setProfile(r.profile)
          setLoading(false)
        })
      } else {
        setRole(null)
        setProfile(null)
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) applySession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) applySession(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    role,
    profile,
    loading,
    signIn: (email, password) =>
      supabase ? supabase.auth.signInWithPassword({ email, password }) : Promise.resolve(NO_SUPABASE),
    signUp: (email, password, fullName) =>
      supabase
        ? supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role: 'patient' } },
          })
        : Promise.resolve(NO_SUPABASE),
    signOut: () => (supabase ? supabase.auth.signOut() : Promise.resolve({})),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve estar dentro de <AuthProvider>')
  return ctx
}
