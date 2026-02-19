# Status do Pente Fino do CMS (Painel de Controle)

Este documento detalha o que está funcional (Real), o que é simulação (Mock) e o que está em progresso.

## 🟢 Visual & Layout (Layout)
| Funcionalidade | Status | Detalhes |
| :--- | :---: | :--- |
| **Logotipo** | ✅ Real | Faz upload e exibe corretamente no Cabeçalho e Rodapé. |
| **Favicon** | ✅ Real | Faz upload e exibe. (Pode exigir limpeza de cache do navegador para atualizar). |
| **Cores da Marca** | ✅ Real | Cor principal (Botões, Destaques) funciona. |
| **Cores de Texto** | ⚠️ Parcial | A cor global funciona, mas "Headers" e seções específicas podem estar herdando cores padrão (Investigando o caso "Laranja"). |
| **Fontes** | ✅ Real | Fontes selecionadas são aplicadas ao site todo. |

## 📄 Páginas & Seções (Home)
| Seção | Status | Detalhes |
| :--- | :---: | :--- |
| **Banners (Hero)** | ✅ Real | Gerenciados na aba "Banners". Rotacionam na home. |
| **Categorias** | ⚠️ Misto | "Categorias principais" é gerado automaticamente. "Banners de Categorias" ainda é simulado. |
| **Lançamentos** | ✅ Real | Mostra produtos reais marcados como "Novo". Suporta Título personalizado e Seleção Manual. |
| **Destaques** | ✅ Real | Mostra produtos reais marcados como "Destaque". Suporta Título e Seleção Manual. |
| **Ofertas** | ✅ Real | Mostra produtos gerais (placeholder) ou Seleção Manual. |
| **Newsletter** | 🚧 Parcial | Visual ajustado (Cores). Captura de e-mail ainda não salva no banco de dados. |
| **Depoimentos** | 🚧 Mock | Exibe componente estático (simulação). Recomendado usar "Google Reviews". |
| **Google Reviews** | ⚠️ Mock | Precisa de integração real com API do Google (Atualmente simula avaliações). |
| **Instagram** | ⚠️ Misto | Tenta carregar feed se configurado, mas pode falhar sem Token válido. |

## 🛍️ Produtos & Loja
| Funcionalidade | Status | Detalhes |
| :--- | :---: | :--- |
| **Cadastro** | ✅ Real | Criar, Editar e Excluir produtos funciona 100%. |
| **Preços** | ✅ Real | Preço Promocional, Estoque e SKU funcionam. |
| **Variações** | ✅ Real | Cores e Tamanhos são salvos e exibidos. |
| **Carrinho** | ✅ Real | Adicionar/Remover funciona. |

## ⚙️ Configurações & Contato
| Funcionalidade | Status | Detalhes |
| :--- | :---: | :--- |
| **WhatsApp/Tel** | ✅ Real | Exibidos no topo e rodapé. Botão Flutuante funcional. |
| **Redes Sociais** | ✅ Real | Ícones de Facebook, Instagram, TikTok, etc. aparecem no rodapé/contato se preenchidos. |
| **Endereço** | ✅ Real | Exibido no rodapé e página de contato. |

## 📝 Próximos Passos (Correções Prioritárias)
1. **Resolver a cor "Laranja" persistente**: Provavelmente um conflito CSS onde a "Cor Primária" (Laranja/Rosa) ganha da "Cor do Texto".
2. **Ativar Newsletter**: Fazer o formulário salvar os e-mails numa lista no admin.
3. **Mudar Depoimentos para Real**: Criar um gerenciador simples de depoimentos no admin.
