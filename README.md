# Apoio Coletivo - Plataforma de Crowdfunding

Uma plataforma de apoio coletivo (crowdfunding) integrada com a API Infinitepay para processar pagamentos de contribuições.

## Funcionalidades Implementadas

### ✅ Página Inicial
- Listagem das campanhas abertas
- Cards com imagem, nome, barra de progresso e valor atual/final
- Botão "Saber mais" que leva para os detalhes da campanha

### ✅ Detalhes da Campanha
- Visualização completa da campanha (nome, descrição, imagens, progresso)
- Lista de contribuições recentes
- Botão para compartilhar nas redes sociais
- Botão para contribuir (abre modal de pagamento)
- Redirecionamento para app Infinitepay após contribuição

### ✅ Fluxo de Contribuição
- Modal para inserir valor da contribuição e dados do contribuinte
- Integração com API Infinitepay para processamento de pagamento
- Página de sucesso após contribuição realizada
- Valores pré-definidos (R$ 10, R$ 25, R$ 50, R$ 100) ou valor personalizado

### ✅ Cadastro de Campanha
- Formulário para criar nova campanha
- Campos: nome, descrição, imagens (URLs), meta, handle do Infinitepay
- Validações de campos obrigatórios
- Integração com dados do usuário logado via Infinitepay API

### ✅ Dashboard do Usuário
- Listagem das campanhas do usuário logado
- Estatísticas: total de campanhas, valor arrecadado, número de contribuições
- Opções para editar campanhas
- Visualização de contribuições recentes por campanha

### ✅ Compartilhamento Social
- Modal de compartilhamento com links para Facebook, Twitter, WhatsApp
- Função para copiar link da campanha
- Textos personalizados para cada rede social

## Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Instale as dependências
npm install

# Configure o banco de dados
npx prisma migrate dev

# Execute a aplicação
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Tecnologias Utilizadas

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Database**: SQLite com Prisma ORM
- **Pagamentos**: Infinitepay MiniApp API
- **UI Components**: Radix UI, Lucide Icons

## Estrutura do Banco de Dados

### Campaigns
- `id`: Identificador único
- `name`: Nome da campanha
- `description`: Descrição detalhada
- `images`: URLs das imagens (JSON)
- `goal`: Meta de arrecadação
- `current`: Valor atual arrecadado (calculado)
- `handle`: Handle Infinitepay que receberá os pagamentos
- `userId`: ID do usuário que criou a campanha

### Contributions
- `id`: Identificador único
- `campaignId`: Referência à campanha
- `amount`: Valor da contribuição
- `contributorName`: Nome do contribuinte
- `contributorEmail`: Email do contribuinte
- `transactionNsu`: NSU da transação Infinitepay
- `status`: Status da contribuição (pending, completed, failed)

## Integração Infinitepay

A aplicação utiliza a API MiniApp do Infinitepay para:
- Obter dados do usuário logado
- Processar pagamentos via checkout
- Redirecionar para o app Infinitepay para finalizar pagamentos

## Rotas da Aplicação

- `/` - Página inicial com lista de campanhas
- `/campaign/[id]` - Detalhes da campanha
- `/create-campaign` - Criar nova campanha
- `/edit-campaign/[id]` - Editar campanha existente
- `/my-campaigns` - Dashboard do usuário
- `/success` - Página de sucesso pós-contribuição

## Funcionalidades Principais

### Para Usuários (Contribuintes)
- ✅ Navegar e descobrir campanhas
- ✅ Ver detalhes completos das campanhas
- ✅ Contribuir com valores personalizados
- ✅ Compartilhar campanhas nas redes sociais
- ✅ Receber confirmação de contribuição realizada

### Para Criadores de Campanha
- ✅ Criar campanhas com descrição rica
- ✅ Adicionar múltiplas imagens
- ✅ Definir metas de arrecadação
- ✅ Receber pagamentos via handle Infinitepay
- ✅ Acompanhar progresso em tempo real
- ✅ Ver lista de contribuintes
- ✅ Editar informações da campanha
