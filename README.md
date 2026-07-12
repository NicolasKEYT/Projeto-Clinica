# Clínica SIGmasters — Protótipo (React + Vite)

Protótipo usável das duas áreas do sistema: **Paciente** e **Doutor**.
Roda 100% com dados fictícios (mock). A troca para o Supabase é feita em
**um único ponto por área** (a constante `USE_MOCK`), sem tocar nos componentes.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Use o **seletor no topo** para alternar entre
"Visão Paciente" e "Visão Doutor" (é uma ferramenta de preview; some quando o
login entrar, porque o perfil virá do usuário autenticado).

## Rotas

- `/paciente` · Início, `/paciente/agendar`, `/paciente/historico`, `/paciente/fotos`
- `/doutor` · Dashboard, `/doutor/procedimentos`, `/doutor/pacientes`, `/doutor/configuracoes`

## Ligar o Supabase (quando o backend existir)

1. Copie `.env.example` para `.env` e preencha as chaves.
2. Em `src/services/patientService.js` e `src/services/doctorService.js`,
   mude `USE_MOCK` para `false`.
3. Pronto. As telas não mudam — só a origem dos dados.

## Estrutura

```
src/
├── lib/supabase.js              # cliente Supabase (com guard para o modo mock)
├── services/
│   ├── patientService.js        # dados do paciente (mock + Supabase pronto)
│   └── doctorService.js         # dados do doutor  (mock + Supabase pronto)
├── hooks/                       # useAsync + hooks por área
├── utils/format.js              # data e preço
├── components/
│   ├── ui.jsx                   # badge, linha, loading, toast
│   ├── RoleSwitcher.jsx         # seletor de visão (preview)
│   ├── RootLayout.jsx           # switcher + outlet
│   ├── PatientLayout.jsx        # sidebar do paciente
│   ├── DoctorLayout.jsx         # sidebar do doutor
│   ├── patient/                 # 4 telas do paciente
│   └── doctor/                  # 4 telas do doutor
├── App.jsx                      # rotas
└── main.jsx                     # entrada
```

> Observação: nas decisões do projeto ficou definido que só há dois perfis
> (paciente e doutor). A antiga "Visão Administrador" do protótipo virou a
> área de gestão do próprio doutor.
