# 🏥 Clínica SIGmasters - Sistema de Gestão Médica

Sistema completo e responsivo para gestão de clínicas, desenvolvido com foco na usabilidade, segurança de dados sensíveis e conformidade estrita com a LGPD. O sistema integra dois perfis de utilizadores (Paciente e Doutor), oferecendo desde o agendamento inteligente de consultas até à gestão de prontuários imutáveis e galerias de fotos clínicas. O próprio doutor acumula as funções administrativas da clínica (gestão de procedimentos, disponibilidade e relatórios).

---

## 🛠️ Stack Tecnológica

* **Frontend:** React + Vite (SPA)
* **Backend / BaaS:** Supabase (Auth, PostgreSQL, Storage, RLS)
* **Banco de Dados:** PostgreSQL (via Supabase)
* **Armazenamento de Arquivos:** Supabase Storage (S3-compatível, com URLs assinadas)
* **Hospedagem & CDN:** Cloudflare (Pages / Proxy)

---

## 🔒 Segurança e LGPD (Core do Sistema)

Por lidar com dados sensíveis de saúde, a segurança é a base da arquitetura:

* **Autenticação:** Gerida pelo Supabase Auth, com senhas armazenadas via hash forte e tokens JWT emitidos automaticamente.
* **Tráfego Seguro:** HTTPS obrigatório em todas as pontas (forçado via Cloudflare).
* **Controlo de Acesso:** RLS (Row Level Security) diretamente no PostgreSQL — o próprio banco garante que um paciente só veja os próprios dados, independente de bugs na aplicação.
* **Privacidade de Imagens:** Fotos armazenadas no Supabase Storage não são públicas. O acesso ocorre exclusivamente via URLs Assinadas de curta duração (ex.: 60 segundos).
* **Auditoria e Imutabilidade:** Prontuários não podem ser apagados ou alterados diretamente (apenas via adendos). Toda a alteração em dados clínicos gera um log de auditoria.

---

## 🗺️ Roadmap de Desenvolvimento

O projeto está estruturado em 7 fases sequenciais e lógicas.

### Fase 0: Fundação
- [ ] Setup do projeto Supabase (criação, chaves, `.env`)
- [ ] Setup do frontend (React + Vite)
- [ ] Estrutura inicial de pastas e roteamento
- [ ] Containerização (Docker/docker-compose) para ambiente local
- [ ] Pipeline básica de CI/CD (GitHub Actions)

### Fase 1: Identidade e acesso
- [ ] Modelar tabelas de usuários, `patients` e `doctors` (migrations)
- [ ] Endpoints de registo (cadastro de paciente; doutor criado internamente)
- [ ] Login com Supabase Auth
- [ ] Guard de rotas no frontend (redirecionamento por perfil)
- [ ] Políticas RLS para separar dados de paciente e doutor

### Fase 2: Cadastros base
- [ ] CRUD de Procedimentos (acesso do doutor)
- [ ] Perfil do Doutor (CRM, especialidade, bio)
- [ ] Perfil do Paciente (CPF, data de nascimento, alergias, contacto)
- [ ] Configuração de Disponibilidade do Doutor (dias e horários padrão)

### Fase 3: Agendamento
- [ ] Lógica de cálculo de slots disponíveis (prevenção de conflito de horários)
- [ ] Endpoint para criar consulta (paciente escolhe procedimento + horário livre)
- [ ] Interface da Agenda do Doutor (visualização em dia/semana/mês)
- [ ] Cancelar e remarcar consulta (com validação de regras de negócio)

### Fase 4: Prontuário e ficha clínica
- [ ] Ficha do Paciente (visão consolidada para o doutor)
- [ ] Registo de prontuário vinculado a uma consulta específica
- [ ] Máquina de estados da consulta (Agendado → Em atendimento → Finalizado)
- [ ] Sistema de auditoria de prontuários (imutabilidade via triggers)

### Fase 5: Galeria de fotos
- [ ] Integração com Supabase Storage para upload e URLs assinadas
- [ ] Categorização de imagens ("Antes" e "Depois")
- [ ] Registo explícito de consentimento do paciente para uso de imagens
- [ ] Galeria renderizada no perfil do paciente e na ficha do doutor

### Fase 6: Notificações, relatórios e polimento
- [ ] Envio de e-mails automáticos de agendamento e cancelamento
- [ ] Relatórios gerenciais (dashboard do doutor)
- [ ] Polimento de UI/UX
- [ ] Deploy final em produção

---

## ☁️ Hospedagem na Cloudflare

A infraestrutura do projeto tira proveito do ecossistema Cloudflare para garantir velocidade e segurança global:

* **Cloudflare Pages:** Utilizado para hospedar o frontend em React. Garante deploy automático a cada push na branch principal, distribuição global em borda (Edge Network) e certificados SSL gratuitos.
* **Cloudflare Proxy (DNS):** Protege a API do Supabase escondendo detalhes de infraestrutura, mitigando ataques e forçando comunicação criptografada (HTTPS Strict).