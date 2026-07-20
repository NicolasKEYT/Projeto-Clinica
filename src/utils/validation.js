// NOVO: arquivo de validações de documentos e campos comuns (CNPJ, telefone, e futuramente CPF)
import { onlyDigits } from './format'

// NOVO: valida CNPJ pelo algoritmo oficial dos dígitos verificadores (não só tamanho/formato)
export function isValidCNPJ(value) {
  const cnpj = onlyDigits(value)

  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false // bloqueia sequências tipo 00000000000000

  function calcCheckDigit(length) {
    const numbers = cnpj.substring(0, length)
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    const sum = numbers
      .split('')
      .reduce((total, digit, i) => total + Number(digit) * weights[i], 0)

    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const digit1 = calcCheckDigit(12)
  const digit2 = calcCheckDigit(13)

  return digit1 === Number(cnpj[12]) && digit2 === Number(cnpj[13])
}

// NOVO: valida telefone brasileiro — precisa ter DDD + número (10 dígitos fixo, 11 celular)
export function isValidPhone(value) {
  const digits = onlyDigits(value)
  return digits.length === 10 || digits.length === 11
}

// NOVO: já deixado pronto pra quando for usar validação de CPF (mesmo algoritmo de dígito verificador, adaptado)
export function isValidCPF(value) {
  const cpf = onlyDigits(value)

  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  function calcCheckDigit(length) {
    const numbers = cpf.substring(0, length)
    const factor = length + 1
    const sum = numbers
      .split('')
      .reduce((total, digit, i) => total + Number(digit) * (factor - i), 0)

    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  const digit1 = calcCheckDigit(9)
  const digit2 = calcCheckDigit(10)

  return digit1 === Number(cpf[9]) && digit2 === Number(cpf[10])
}