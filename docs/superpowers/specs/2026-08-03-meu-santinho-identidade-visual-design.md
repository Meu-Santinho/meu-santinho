# Meu Santinho — Especificação da identidade visual

**Data:** 3 de agosto de 2026  
**Status:** aprovado para implementação
**Escopo:** logomarca e fundamentos essenciais da identidade visual

## 1. Objetivo

Meu Santinho é uma ferramenta apartidária para o eleitor organizar a lista de candidatos em quem pretende votar nas eleições brasileiras e, opcionalmente, gerar uma composição vertical de 1080 × 1920 px para compartilhar no Instagram Stories.

A identidade deve comunicar duas funções com igual importância:

1. organizar escolhas eleitorais para consulta pessoal;
2. permitir o compartilhamento voluntário dessas escolhas.

A marca não representa candidato, partido, governo, tribunal eleitoral ou campanha. A neutralidade deve permanecer evidente mesmo quando o conteúdo gerado pelo usuário exibir candidatos e partidos.

## 2. Posicionamento

### Personalidade principal

- popular;
- digital;
- acessível;
- jovem sem ser infantil;
- brasileira sem parecer institucional;
- confiável sem parecer burocrática.

### Promessa

“Organize suas escolhas e compartilhe se quiser.”

Essa frase expressa o posicionamento, mas não integra obrigatoriamente a logomarca.

## 3. Arquitetura do nome

A marca principal é **Meu Santinho**. O ano não faz parte do nome permanente.

**Eleições 2026** é uma assinatura sazonal desacoplada. Ela pode ser removida ou substituída em futuras eleições sem alterar o símbolo ou o nome principal.

Formas aprovadas:

- principal: `meu santinho`;
- edição vigente: `meu santinho` + selo textual `eleições 2026`;
- símbolo isolado para avatar, favicon e espaços reduzidos.

## 4. Conceito da logomarca

### Metáfora central

O símbolo representa um pequeno cartão de papel inclinado, acompanhado por uma marca de confirmação circular sobreposta.

O cartão recupera o significado brasileiro de “santinho eleitoral”, mas remove fotografia, número, partido e qualquer sinal de propaganda. A confirmação transforma o objeto em uma lista pessoal organizada.

### Estrutura selecionada

A abordagem aprovada é **cartão + assinatura**:

- símbolo independente à esquerda;
- nome em duas linhas à direita na composição principal;
- versão horizontal de uma linha para espaços largos;
- símbolo isolado para tamanhos reduzidos;
- assinatura sazonal posicionada separadamente.

O símbolo não deve incorporar a letra “S”. A composição não deve adotar formato de selo circular como versão principal.

### Geometria e acabamento

- cartão inclinado aproximadamente −5°;
- contorno espesso e uniforme;
- cantos generosamente arredondados;
- duas linhas internas simples sugerindo uma lista;
- confirmação circular parcialmente sobreposta ao canto inferior direito;
- cores chapadas;
- ausência de gradientes, brilho, volume fotográfico ou sombras difusas;
- sombra gráfica sólida amarela permitida atrás do cartão.

## 5. Assinatura tipográfica

O nome aparece prioritariamente em caixa baixa: **meu santinho**.

Características do lettering:

- peso alto;
- formas arredondadas;
- largura moderada;
- espaçamento compacto, mas sem colisões;
- leitura preservada em tamanhos pequenos;
- tom próximo e não autoritário.

O arquivo final deve converter o lettering em formas vetoriais. A logomarca não pode depender da instalação de uma fonte no dispositivo do usuário. Uma fonte arredondada pode servir como ponto de partida durante o desenho, mas as formas finais devem receber ajustes ópticos próprios.

## 6. Paleta oficial

| Função | Nome | Valor |
|---|---|---|
| Contornos e texto escuro | Verde profundo | `#143C35` |
| Nome da marca | Azul brasileiro | `#0759A5` |
| Confirmação e ação positiva | Verde vivo | `#168F61` |
| Destaque e sombra gráfica | Amarelo açafrão | `#F6C700` |
| Fundo claro principal | Névoa clara | `#F2F7EF` |
| Área interna do cartão e versão neutra | Branco | `#FFFFFF` |

### Regras cromáticas

- o amarelo funciona como destaque, selo ou sombra gráfica, não como fundo permanente de todas as peças;
- o verde vivo indica confirmação ou ação positiva;
- o azul identifica o nome da marca;
- o verde profundo substitui preto puro nos contornos e textos da identidade;
- a combinação deve preservar a interpretação “Brasil contemporâneo”, sem reproduzir literalmente a bandeira;
- a implementação deverá incluir versões positiva, negativa e monocromática.

## 7. Sistema de versões

O pacote final deverá conter:

1. logomarca principal com nome em duas linhas;
2. logomarca horizontal com nome em uma linha;
3. símbolo isolado;
4. versão com assinatura `eleições 2026`;
5. versões positiva para fundo claro;
6. versões negativa para fundo escuro;
7. versão monocromática;
8. favicon simplificado, se o teste em 24 px exigir remoção das linhas internas.

## 8. Aplicações previstas

### Produto digital

No cabeçalho do site, utilizar o símbolo compacto ao lado do nome. A marca deve permanecer visualmente separada do botão principal de ação.

### Avatar e ícone

Utilizar o símbolo isolado centralizado sobre fundo névoa clara. O avatar pode usar um quadrado de cantos arredondados, mas esse contêiner não faz parte do desenho permanente do símbolo.

### Story de 1080 × 1920 px

A marca pode aparecer no cabeçalho ou rodapé do story. Ela não deve competir com os nomes dos candidatos.

O exemplo de aplicação aprovado estabelece os seguintes princípios para o futuro layout do story:

- cards de candidatos com fundo uniforme;
- nenhuma barra colorida na lateral esquerda;
- indicador circular pequeno para confirmar a seleção;
- hierarquia baseada em fotografia, nome, cargo e confirmação;
- ausência de gradientes, brilhos e excesso de cápsulas decorativas.

Esses princípios não constituem ainda a especificação completa do story. O layout de 1080 × 1920 px será tratado em um ciclo de design separado após a implementação da logomarca.

## 9. Neutralidade política

A assinatura Meu Santinho nunca deve ser fundida visualmente com:

- número eleitoral;
- fotografia de candidato;
- estrela ou símbolo partidário;
- sigla partidária;
- slogan de campanha;
- cor apresentada como exclusiva de um candidato ou partido.

Esses elementos podem aparecer no conteúdo criado pelo usuário, mas devem ocupar uma camada visual claramente separada da marca do produto.

## 10. Critérios de qualidade e testes

A implementação somente estará concluída quando cumprir todos os itens abaixo:

- símbolo reconhecível a 24 × 24 px;
- nome legível na menor aplicação prevista para o cabeçalho do produto;
- ausência de colisões entre confirmação, cartão e sombra gráfica;
- funcionamento sobre fundos claros e escuros;
- versão monocromática compreensível sem depender de diferenças de cor;
- contornos visualmente consistentes após redução;
- SVG sem imagens bitmap incorporadas;
- PNGs exportados com transparência correta;
- conferência visual em 1×, 2× e tamanho de avatar;
- comparação lado a lado entre SVG renderizado e PNG exportado.

Se as duas linhas internas do cartão perderem definição em 24 px, a versão favicon deverá removê-las. Isso é uma simplificação aprovada, não uma alteração do conceito.

## 11. Entregáveis de implementação

- arquivos SVG mestres e otimizados;
- PNG transparente nas dimensões necessárias para uso digital;
- avatar quadrado em alta resolução;
- favicon simplificado;
- folha de apresentação com versões, paleta e área de proteção;
- arquivo curto de orientação de uso;
- fontes de edição ou curvas vetoriais necessárias para manutenção futura.

## 12. Fora de escopo nesta etapa

- interface completa do site;
- seleção e armazenamento de candidatos;
- integração com dados eleitorais;
- programação do gerador de imagens;
- composição final do story;
- tom editorial de textos políticos;
- estratégia de domínio, lançamento ou redes sociais.

Esses itens exigem especificações próprias. A próxima etapa deste trabalho é planejar a implementação dos arquivos da logomarca aprovada.
