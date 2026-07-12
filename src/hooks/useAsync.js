import { useEffect, useState } from 'react'

// Hook genérico de carregamento assíncrono.
// Como os serviços já são async, vale tanto para o mock quanto para o Supabase.
export function useAsync(asyncFn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    let active = true
    setState({ data: null, loading: true, error: null })
    asyncFn()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
