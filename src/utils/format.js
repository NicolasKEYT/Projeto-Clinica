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

// NOVO: remove tudo que não for dígito. Usado como base pelas máscaras e pelas validações.
export function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

// NOVO: aplica a máscara de CNPJ (00.000.000/0000-00) progressivamente, enquanto o usuário digita
export function maskCNPJ(value) {
  const digits = onlyDigits(value).slice(0, 14)

  if (digits.length > 12) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5')
  }
  if (digits.length > 8) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4')
  }
  if (digits.length > 5) {
    return digits.replace(/^(\d{2})(\d{3})(\d{1,3})$/, '$1.$2.$3')
  }
  if (digits.length > 2) {
    return digits.replace(/^(\d{2})(\d{1,3})$/, '$1.$2')
  }
  return digits
}

// NOVO: aplica a máscara de telefone — (00) 0000-0000 pra fixo, (00) 00000-0000 pra celular
export function maskPhone(value) {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length > 10) {
    return digits.replace(/^(\d{2})(\d{5})(\d{1,4})$/, '($1) $2-$3')
  }
  if (digits.length > 6) {
    return digits.replace(/^(\d{2})(\d{4})(\d{1,4})$/, '($1) $2-$3')
  }
  if (digits.length > 2) {
    return digits.replace(/^(\d{2})(\d{1,4})$/, '($1) $2')
  }
  if (digits.length > 0) {
    return digits.replace(/^(\d{1,2})$/, '($1')
  }
  return digits
}