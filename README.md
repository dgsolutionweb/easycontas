# Gerenciador de Contas

Um aplicativo simples para gerenciar suas contas mensais, com a opção de dividir o valor entre duas pessoas.

## Características

- Cadastro de contas com descrição, valor e data de vencimento
- Opção para marcar contas como pagas
- Opção para dividir o valor da conta entre duas pessoas
- Filtragem de contas por status (todas, pendentes, pagas, vencidas)
- Busca por descrição
- Cálculo do valor total e do valor após divisões

## Tecnologias Utilizadas

- React + TypeScript
- Vite como bundler
- Tailwind CSS v3 para estilização
- Supabase como backend-as-a-service
- React Router para roteamento
- Lucide React para ícones
- React Hot Toast para notificações

## Pré-requisitos

- Node.js 18 ou superior
- NPM ou Yarn
- Conta no Supabase

## Configuração do Projeto

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/gerenciador-de-contas.git
cd gerenciador-de-contas
```

2. Instale as dependências:

```bash
npm install
```

3. Configure seu projeto no Supabase:

   - Crie uma conta no [Supabase](https://supabase.io)
   - Crie um novo projeto
   - Crie uma tabela `bills` com os seguintes campos:
     - `id` (tipo UUID, primary key)
     - `description` (tipo text, not null)
     - `amount` (tipo numeric, not null)
     - `due_date` (tipo date, not null)
     - `paid` (tipo boolean, default false)
     - `split` (tipo boolean, default false)
     - `created_at` (tipo timestamp with timezone, default now())
   - Você pode executar o script SQL localizado em `supabase/init.sql` para criar a tabela e configurar as políticas de segurança

4. Configure suas variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis com as informações do seu projeto no Supabase (encontradas em "Project Settings > API")

```bash
cp .env.example .env
```

5. Execute o aplicativo em modo de desenvolvimento:

```bash
npm run dev
```

## Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis da UI
├── lib/              # Utilitários e configurações (Supabase)
├── pages/            # Páginas da aplicação
├── types/            # Definições de tipos TypeScript
└── App.tsx           # Componente principal
```

## Uso

1. Adicione novas contas clicando no botão "Nova Conta"
2. Preencha os detalhes da conta (descrição, valor, data de vencimento)
3. Marque a opção "Dividir em 2" se quiser dividir o valor
4. Visualize, edite ou exclua contas conforme necessário
5. Use os filtros para organizar suas contas

## Licença

Este projeto está licenciado sob a licença MIT.
