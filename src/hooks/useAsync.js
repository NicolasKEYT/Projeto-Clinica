import { useCallback, useEffect, useState } from 'react' // ALTERADO: adicionado useCallback

// Hook genérico de carregamento assíncrono.
// Como os serviços já são async, vale tanto para o mock quanto para o Supabase.
export function useAsync(asyncFn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [reloadKey, setReloadKey] = useState(0) // NOVO: controla quando forçar um recarregamento

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
  }, [...deps, reloadKey]) // ALTERADO: reloadKey adicionado às deps para permitir refetch manual

  // NOVO: função que incrementa reloadKey, disparando o useEffect de novo
  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  return { ...state, refetch } // ALTERADO: refetch agora é retornado junto com data/loading/error
}
