const constants = {
  cargos: [
    { nome: "Governador", codigo: 3 },
    { nome: "Vice-governador", codigo: 4 },
    { nome: "Senador", codigo: 5 },
    { nome: "Deputado Federal", codigo: 6 },
    { nome: "Deputado Estadual", codigo: 7 },
    // { nome: "1º Suplente", codigo: 9 },
    // { nome: "2º Suplente", codigo: 10 },
  ],
  eleicao: "2040602022",
};

export default {
  async listarCandidatos(uf: string) {
    const candidatos = await Promise.all(
      constants.cargos.map(async ({ codigo, nome }) => {
        const { candidatos } = await fetch(
          `${api.baseUrl}/${api.routes.listarCandidatos(
            uf,
            constants.eleicao,
            `${codigo}`
          )}`
        ).then((r) => r.json());
        console.log({ candidatos });
        return { nome, candidatos } as {
          nome: string;
          candidatos: Candidato[];
        };
      })
    );

    return candidatos;
  },
};

const api = {
  baseUrl: "https://divulgacandcontas.tse.jus.br/divulga/rest/v1/",
  routes: {
    listarCandidatos: (uf: string, eleicaoId: string, cargoId: string) =>
      `candidatura/listar/2022/${uf}/${eleicaoId}/${cargoId}/candidatos`,
  },
};

export interface Candidato {
  id: number;
  nomeUrna: string;
  numero: number;
  idCandidatoSuperior: null;
  nomeCompleto: string;
  descricaoSexo: null;
  dataDeNascimento: null;
  tituloEleitor: null;
  cpf: null;
  descricaoEstadoCivil: null;
  descricaoCorRaca: null;
  descricaoSituacao: string;
  nacionalidade: null;
  grauInstrucao: null;
  ocupacao: null;
  gastoCampanha1T: null;
  gastoCampanha2T: null;
  sgUfNascimento: null;
  nomeMunicipioNascimento: null;
  localCandidatura: null;
  ufCandidatura: null;
  ufSuperiorCandidatura: null;
  dataUltimaAtualizacao: null;
  fotoUrl: null;
  fotoDataUltimaAtualizacao: null;
  descricaoTotalizacao: string;
  nomeColigacao: string;
  composicaoColigacao: null;
  descricaoTipoDrap: null;
  numeroProcessoDrap: null;
  numeroProcessoDrapEncrypt: null;
  numeroProcesso: null;
  numeroProcessoEncrypt: null;
  numeroProcessoPrestContas: null;
  numeroProcessoPrestContasEncrypt: null;
  numeroProtocolo: null;
  cargo: Cargo;
  bens: null;
  totalDeBens: null;
  vices: null;
  partido: Partido;
  eleicao: Eleicao;
  emails: null;
  sites: null;
  arquivos: null;
  eleicoesAnteriores: null;
  substituto: null;
  motivos: null;
  codigoSituacaoCandidato: null;
  descricaoSituacaoCandidato: null;
  isCandidatoInapto: null;
  codigoSituacaoPartido: null;
  descricaoSituacaoPartido: null;
  isCandFechado: null;
  st_MOTIVO_ABUSO_PODER: null;
  st_MOTIVO_COMPRA_VOTO: null;
  st_SUBSTITUIDO: null;
  st_MOTIVO_FICHA_LIMPA: null;
  st_MOTIVO_GASTO_ILICITO: null;
  st_MOTIVO_IND_PARTIDO: null;
  st_MOTIVO_CONDUTA_VEDADA: null;
  cnpjcampanha: null;
  gastoCampanha: number;
  st_DIVULGA: null;
  st_DIVULGA_BENS: null;
  st_REELEICAO: boolean;
  st_DIVULGA_ARQUIVOS: null;
  ds_MOTIVO_OUTROS: null;
  st_MOTIVO_AUSENCIA_REQUISITO: null;
  descricaoNaturalidade: string;
}

export interface Cargo {
  codigo: number;
  sigla: null;
  nome: string;
  codSuperior: number;
  titular: boolean;
  contagem: number;
}

export interface Eleicao {
  id: number;
  siglaUF: null;
  localidadeSgUe: null;
  ano: number;
  codigo: null;
  nomeEleicao: null;
  tipoEleicao: null;
  turno: null;
  tipoAbrangencia: null;
  dataEleicao: null;
  codSituacaoEleicao: null;
  descricaoSituacaoEleicao: null;
  descricaoEleicao: string;
}

export interface Partido {
  numero: number;
  sigla: string;
  nome: null;
}
