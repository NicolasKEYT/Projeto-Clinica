export function formatDate(dateString, format = 'short') {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return String(dateString ?? '')

  if (format === 'full') {
    return date
      .toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace('de ', '')
  }
  return date.toLocaleDateString('pt-BR')
}

export function formatPrice(value) {
  const number = Number(value ?? 0)
  return 'R$ ' + number.toFixed(2).replace('.', ',')
}
