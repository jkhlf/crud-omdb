# Sistema de Votação de Filmes/Séries

Aplicação full-stack para cadastro e votação de conteúdos audiovisuais.

## ✅ Checklist de Requisitos

### Funcionalidades Obrigatórias

| Requisito               | Status  | Detalhes da Implementação |
|-------------------------|---------|---------------------------|
| **Exibição de Itens**   | ✔️ 100% | - Cards com título, gênero, descrição e imagem<br>- Botões "Gostei"/"Não Gostei"<br>- 5+ itens iniciais |
| **Sistema de Votação**  | ✔️ 100% | - Contadores por item (👍/👎)<br>- Persistência em banco de dados<br>- Totais gerais no Dashboard |
| **Cadastro de Itens**   | ✔️ 100% | - Formulário com campos obrigatórios/opcionais<br>- Validação básica<br>- Integração com OMDB API |
| **Persistência de Dados** | ✔️ 100% | - PostgreSQL com Neon<br>- CRUD completo via API REST |

### Requisitos Técnicos

| Área         | Entregue                                                                 |
|--------------|--------------------------------------------------------------------------|
| **Frontend** | - Interface com HTML/CSS/JS<br>- Abas separadas<br>- Design responsivo   |
| **Backend**  | - API Node.js/Express<br>- 6 endpoints REST<br>- Conexão com PostgreSQL |
| **Dados**    | - Estrutura SQL conforme especificado<br>- Migration inicial incluída    |

## Extras Implementados

- Dashboard analítico com métricas
- Busca automática de filmes (OMDB)
- Animações e feedback visual
- Sistema de ranking dos top 5

# Checklist 
- [x] Exibir 5+ filmes/séries (cards com imagem, título, gênero)
- [x] Botões "Gostei"/"Não Gostei" funcionais 
- [x] Contadores de votos por item e totais gerais
- [x] Formulário de cadastro com validação
- [x] Persistência em PostgreSQL
- [x] API REST com 6 endpoints
- [x] Frontend responsivo
- [x] Integração com OMDB API
