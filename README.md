# 🏥 Clínica SIGmasters - Sistema de Gestão Médica

Sistema completo e responsivo para gestão de clínicas, desenvolvido com foco na usabilidade, segurança de dados sensíveis e conformidade estrita com a LGPD. O sistema integra três perfis principais de utilizadores (Paciente, Doutor e Administrador), oferecendo desde o agendamento inteligente de consultas até à gestão de prontuários imutáveis e galerias de fotos clínicas.

---

## 🛠️ Stack Tecnológica

* **Frontend:** React (SPA)
* **Backend:** Node.js / Python (API RESTful)
* **Banco de Dados:** PostgreSQL (Relacional)
* **Armazenamento de Arquivos:** AWS S3 (ou Cloudflare R2 compatível com S3)
* **Hospedagem & CDN:** Cloudflare (Pages / Workers / Proxy)

---

## 🔒 Segurança e LGPD (Core do Sistema)

Por lidar com dados sensíveis de saúde, a segurança é a base da arquitetura:

* **Criptografia:** Senhas com hash forte (Bcrypt/Argon2).
* **Tráfego Seguro:** HTTPS obrigatório em todas as pontas (forçado via Cloudflare).
* **Controlo de Acesso:** Autenticação via JWT com tempo de expiração e middlewares de autorização por perfil (RBAC).
* **Privacidade de Imagens:** Fotos armazenadas em Object Storage não são públicas. O acesso ocorre exclusivamente via URLs Assinadas de curta duração.
* **Auditoria e Imutabilidade:** Prontuários não podem ser apagados ou alterados diretamente (apenas via adendos). Toda a alteração em dados clínicos gera um log de auditoria.

---

## 🗺️ Roadmap de Desenvolvimento

O projeto está estruturado em 7 fases sequenciais e lógicas.

### Fase 0: Fundação
- [ ] Configuração do Banco de Dados (PostgreSQL)
- [ ] Setup do framework backend e repositório
- [ ] Containerização inicial (Docker/docker-compose)
- [ ] Pipeline básica de CI/CD
- [ ] Definição da estrutura de pastas do projeto

### Fase 1: Identidade e acesso
- [ ] Modelar tabela de utilizadores (Migrations)
- [ ] Criar endpoints de registo (Paciente e Doutor)
- [ ] Implementar Login com JWT
- [ ] Criar Middlewares de permissões (Admin, Doutor, Paciente)

### Fase 2: Cadastros base
- [ ] CRUD de Procedimentos (Acesso Doutor/Admin)
- [ ] Perfil do Doutor (CRM, especialidade, bio)
- [ ] Perfil do Paciente (CPF, data de nascimento, alergias, contacto)
- [ ] Configuração de Disponibilidade do Doutor (Dias e horários padrão)

### Fase 3: Agendamento
- [ ] Lógica de cálculo de slots disponíveis (Prevenção de conflito de horários)
- [ ] Endpoint para criar consulta (Paciente escolhe procedimento + horário livre)
- [ ] Interface da Agenda do Doutor (Visualização em Dia/Semana/Mês)
- [ ] Funcionalidade de cancelar e remarcar consulta (com validação de regras de negócio)

### Fase 4: Prontuário e ficha clínica
- [ ] Ficha do Paciente (Visão consolidada para o doutor)
- [ ] Registo de prontuário vinculado a uma consulta específica
- [ ] Implementação da máquina de estados da consulta (Agendado -> Em atendimento -> Finalizado)
- [ ] Sistema de Auditoria de prontuários (Imutabilidade)

### Fase 5: Galeria de fotos
- [ ] Integração com Object Storage (S3/Cloudflare R2) para geração de URLs assinadas de upload/download
- [ ] Sistema de categorização de imagens ("Antes" e "Depois")
- [ ] Registo explícito de consentimento do paciente para uso de imagens
- [ ] Galeria renderizada no perfil do paciente e na ficha visualizada pelo doutor

### Fase 6: Notificações, relatórios e polimento
- [ ] Disparo de e-mails/alertas automáticos de agendamento e cancelamento
- [ ] Relatórios gerenciais (Dashboard do Administrador)
- [ ] Polimento de UI/UX
- [ ] Deploy final em produção

---

## ☁️ Hospedagem na Cloudflare

A infraestrutura do projeto tira proveito do ecossistema Cloudflare para garantir velocidade e segurança global:

* **Cloudflare Pages:** Utilizado para hospedar o frontend em React. Garante deploy automático a cada push na branch principal, distribuição global em borda (Edge Network) e certificados SSL gratuitos.
* **Cloudflare Proxy (DNS):** Protege a API do backend escondendo o IP original do servidor, mitigando ataques DDoS e forçando a comunicação criptografada (HTTPS Strict).
* **Cloudflare R2 (Opcional):** Como alternativa cost-effective ao AWS S3, podemos utilizar o R2 para armazenar as fotos com API 100% compatível com a do S3 (evitando taxas de egress).

