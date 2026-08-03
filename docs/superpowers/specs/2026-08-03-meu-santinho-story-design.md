# Meu Santinho — Especificação do story eleitoral

**Data:** 3 de agosto de 2026  
**Status:** conceito visual aprovado; especificação aguardando revisão final  
**Escopo:** template vazio de story e contrato futuro de renderização pela Canvas API

## 1. Objetivo

Criar um story vertical de 1080 × 1920 px no qual o usuário possa organizar e compartilhar as seis escolhas do primeiro turno das Eleições Gerais de 2026. O template será preenchido programaticamente pela Canvas API do navegador.

O mockup raster será produzido com ImageGen para orientar composição e acabamento. Ele não substituirá a implementação determinística em Canvas e não conterá candidatos, números, partidos ou fotografias fictícias.

## 2. Base eleitoral

O story seguirá a ordem oficial da urna eletrônica em 2026:

1. deputado federal;
2. deputado estadual ou distrital;
3. senador — primeira vaga;
4. senador — segunda vaga;
5. governador;
6. presidente da República.

O Tribunal Superior Eleitoral informa que cada eleitor fará seis escolhas e que os dois votos para o Senado devem ser destinados a pessoas diferentes.

Fontes oficiais:

- [TSE — ordem de votação nas Eleições 2026](https://www.tse.jus.br/comunicacao/noticias/2026/Marco/eleicoes-2026-conheca-a-ordem-de-votacao-na-urna-eletronica)
- [TSE — dois votos para o Senado em 2026](https://www.tse.jus.br/comunicacao/noticias/2026/Julho/justica-eleitoral-pelo-brasil-campanha-do-tre-ro-orienta-eleitorado-sobre-os-seis-votos-em-2026)

O template desta especificação é exclusivo do primeiro turno. Uma composição eventual de segundo turno exigirá outro template, pois terá apenas as disputas majoritárias aplicáveis.

## 3. Conteúdo fixo

### Cabeçalho

- logomarca horizontal Meu Santinho;
- selo separado `2026`;
- título sem frase adicional: `meu santinho 2026`.

A marca será renderizada a partir dos SVGs existentes no projeto. O ImageGen não deverá redesenhar nem substituir a logomarca oficial.

### Cargos

Os rótulos fixos serão:

- `deputado federal`;
- `deputado estadual` ou `deputado distrital` quando a UF for `DF`;
- `senador · 1ª vaga`;
- `senador · 2ª vaga`;
- `governador`;
- `presidente`.

### Rodapé

- faixa azul sólida;
- texto central `MEUSANTINHO.COM.BR`;
- nenhuma mensagem política, slogan de campanha ou pedido de voto.

## 4. Estrutura do canvas

- dimensão final: 1080 × 1920 px;
- margem lateral: 72 px;
- zona protegida superior de 120 px;
- seis linhas verticais iguais, na ordem da urna;
- altura de referência de cada linha: 210 px;
- espaçamento uniforme entre linhas;
- zona protegida inferior de 180 px;
- conteúdo político separado visualmente da assinatura da marca.

Nenhum texto essencial, fotografia ou número poderá invadir as zonas protegidas. Elementos decorativos parcialmente cortados podem ocupar essas áreas desde que não carreguem informação.

## 5. Anatomia do bloco de candidato

Cada uma das seis linhas terá três regiões:

1. fotografia quadrada de 170 × 170 px com cantos arredondados;
2. área central para cargo, nome e partido;
3. área amarela à direita para o número.

### Hierarquia

- cargo: pequeno, verde vivo, caixa alta visual e espaçamento amplo;
- nome: maior elemento textual do bloco, verde profundo;
- partido: secundário, azul e menor que o nome;
- número: alto contraste, verde profundo sobre amarelo açafrão.

Os blocos usam fundo branco uniforme e contorno fino de baixa opacidade. Não haverá barra colorida lateral, sombra difusa, gradiente ou decoração individual por partido.

## 6. Paleta e acabamento

| Função | Cor |
|---|---|
| Fundo geral | `#F2F7EF` |
| Contornos e nomes | `#143C35` |
| Marca, partido e rodapé | `#0759A5` |
| Cargos e confirmação | `#168F61` |
| Número, ano e destaque | `#F6C700` |
| Cards e área interna | `#FFFFFF` |

Elementos decorativos permitidos:

- um círculo amarelo parcialmente cortado no canto superior direito;
- um ponto verde parcialmente cortado próximo ao rodapé.

Esses dois elementos não podem invadir os blocos nem alterar a leitura. Não serão adicionados outros ornamentos.

## 7. Contrato de dados

O renderizador receberá um objeto com esta forma lógica:

```js
{
  uf,
  federalDeputy,
  stateOrDistrictDeputy,
  senatorFirstSeat,
  senatorSecondSeat,
  governor,
  president
}
```

Cada posição de candidato terá:

```js
{
  id,
  photo,
  name,
  number,
  party
}
```

`number` será uma string. Os comprimentos esperados são:

| Cargo | Dígitos |
|---|---:|
| Deputado federal | 4 |
| Deputado estadual ou distrital | 5 |
| Senador | 3 |
| Governador | 2 |
| Presidente | 2 |

Os dados do candidato não podem alterar posições, dimensões, paleta, tipografia da marca ou ordem dos cargos.

`id` será uma string estável usada apenas para validação e não será desenhada no story.

## 8. Comportamento de renderização

### Fotografias

- recorte central proporcional equivalente a `object-fit: cover`;
- nenhuma deformação;
- cantos arredondados aplicados por clipping;
- se o carregamento falhar, usar silhueta neutra da identidade;
- a foto nunca ultrapassa sua região.

### Nomes

- até duas linhas;
- tamanho preferencial de 42 px, reduzido progressivamente até 30 px;
- se ainda exceder a área, truncar de forma determinística;
- preservar acentos e caracteres do português.

### Campos ausentes

- o bloco permanece na posição correta;
- o cargo continua visível;
- foto, nome, partido e número permanecem neutros e vazios;
- não inventar mensagens como `não selecionado`.

### Senado

- as duas posições são obrigatoriamente distintas;
- a mesma identidade de candidato não pode ocupar as duas vagas;
- uma duplicidade impede a exportação e deve retornar erro de validação para a interface.

### Unidade da Federação

- para `DF`, usar `deputado distrital`;
- para as demais UFs, usar `deputado estadual`.

## 9. Uso do ImageGen

O mockup será uma geração nova no modo integrado do ImageGen, classificada como `ui-mockup`.

### Entradas visuais

- identidade existente descrita pela paleta e pela folha de marca;
- estrutura de lista vertical aprovada;
- seis áreas vazias e equivalentes;
- nenhum retrato, nome, número ou partido fictício.

### Texto obrigatório no mockup

- `meu santinho`;
- `2026`;
- os seis rótulos de cargo definidos na seção 3;
- `MEUSANTINHO.COM.BR`.

O ImageGen poderá deformar textos ou a logomarca. Por isso, sua saída será tratada como referência visual, inspecionada e, se necessário, receberá uma única iteração dirigida. O arquivo final programável usará a logomarca vetorial real e texto desenhado pela Canvas API.

## 10. Neutralidade política

- não usar pessoas reais ou fictícias no mockup;
- não usar números eleitorais de exemplo;
- não usar siglas, cores ou símbolos partidários;
- não destacar presidente ou governador em relação aos outros cargos;
- não permitir que dados de partido alterem o card;
- manter a marca separada do conteúdo eleitoral.

## 11. Critérios de qualidade

### Mockup do ImageGen

- composição integral dentro de uma área central 9:16, permitindo recorte ou redimensionamento para 1080 × 1920 sem perda de conteúdo;
- seis blocos claramente distintos e na ordem correta;
- hierarquia compatível com a identidade aprovada;
- campos de candidato vazios;
- nenhum gradiente, sombra difusa, barra lateral ou cápsulas em excesso;
- nenhum candidato, rosto, número ou partido inventado;
- arquivo persistido no workspace, não apenas na pasta padrão de geração.

### Implementação Canvas

- exportação PNG de 1080 × 1920 px;
- ordem dos seis votos preservada;
- rótulo distrital condicionado a `DF`;
- validação de dígitos por cargo;
- rejeição de senador duplicado;
- nomes curtos, longos e acentuados testados;
- seis fotos de proporções diferentes testadas;
- falha de fotografia testada;
- prévia conferida em tamanho de celular;
- comparação visual com o mockup aprovado.

## 12. Entregáveis

1. mockup de referência gerado pelo ImageGen e salvo no projeto;
2. prompt final registrado;
3. template programático em Canvas;
4. tipos e validações do contrato de dados;
5. testes automatizados do renderizador;
6. imagem PNG de demonstração em 1080 × 1920 px;
7. documentação curta de integração.

## 13. Fora de escopo

- seleção de candidatos na interface;
- obtenção ou atualização de dados eleitorais;
- hospedagem e compartilhamento automático no Instagram;
- template de segundo turno;
- personalização de cores por partido;
- textos de campanha ou recomendação política.
