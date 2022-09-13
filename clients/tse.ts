const constants = {
  cargos: [
    { nome: "Governador", codigo: 3 },
    // { nome: "Vice-governador", codigo: 4 },
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
          `${api.baseUrl}/${
            api.routes.listarCandidatos(
              uf,
              constants.eleicao,
              `${codigo}`,
            )
          }`,
        ).then((r) => r.json());
        return { nome, candidatos } as {
          nome: string;
          candidatos: Candidato[];
        };
      }),
    );

    return candidatos;
  },

  async infosCandidato(uf: string, candidatoId: string) {
    const infosCandidato = await fetch(
      `${api.baseUrl}/${
        api.routes.infosCandidato(
          uf,
          constants.eleicao,
          candidatoId,
        )
      }`,
    ).then((res) => res.json()).catch((error ) => console.log(error));
   
    return infosCandidato;
  },
};

const api = {
  baseUrl: "https://divulgacandcontas.tse.jus.br/divulga/rest/v1/",
  routes: {
    listarCandidatos: (uf: string, eleicaoId: string, cargoId: string) =>
      `candidatura/listar/2022/${uf}/${eleicaoId}/${cargoId}/candidatos`,

    infosCandidato: (uf: string, eleicaoId: string, candidatoId: string) =>
      `candidatura/buscar/2022/${uf}/${eleicaoId}/candidato/${candidatoId}`,
  },
};

export interface infosCandidato {
  id: number;
  nomeUrna: string;
  numero: number;
  idCandidatoSuperior: number;
  nomeCompleto: string;
  descricaoSexo: string;
  dataDeNascimento: string;
  tituloEleitor: string;
  cpf: string;
  descricaoEstadoCivil: string;
  descricaoCorRaca: string;
  descricaoSituacao: string;
  nacionalidade: string;
  grauInstrucao: string;
  ocupacao: string;
  gastoCampanha1T: number;
  gastoCampanha2T: number;
  sgUfNascimento: string;
  nomeMunicipioNascimento: string;
  localCandidatura: string;
  ufCandidatura: string;
  ufSuperiorCandidatura: string;
  dataUltimaAtualizacao: string;
  fotoUrl: string;
  fotoDataUltimaAtualizacao: null;
  descricaoTotalizacao: string;
  nomeColigacao: string;
  composicaoColigacao: string;
  descricaoTipoDrap: string;
  numeroProcessoDrap: string;
  numeroProcessoDrapEncrypt: string;
  numeroProcesso: string;
  numeroProcessoEncrypt: string;
  numeroProcessoPrestContas: string;
  numeroProcessoPrestContasEncrypt: string;
  numeroProtocolo: null;
  cargo: {
    codigo: number;
    sigla: null;
    nome: string;
    codSuperior: number;
    titular: boolean;
    contagem: number;
  };
  bens: [
    {
      ordem: number;
      descricao: string;
      descricaoDeTipoDeBem: string;
      valor: number;
      dataUltimaAtualizacao: string;
    },
    {
      ordem: number;
      descricao: string;
      descricaoDeTipoDeBem: string;
      valor: number;
      dataUltimaAtualizacao: string;
    },
    {
      ordem: number;
      descricao: string;
      descricaoDeTipoDeBem: string;
      valor: number;
      dataUltimaAtualizacao: string;
    },
  ];
  totalDeBens: number;
  vices: [
    {
      DT_ULTIMA_ATUALIZACAO: string;
      nomeColigacao: null;
      composicaoColigacao: null;
      stRegistro: null;
      situacaoCandidato: null;
      urlFoto: string;
      sq_ELEICAO: number;
      sq_CANDIDATO: number;
      sq_CANDIDATO_SUPERIOR: null;
      nr_CANDIDATO: string;
      nm_URNA: string;
      nm_CANDIDATO: string;
      ds_CARGO: string;
      nm_PARTIDO: string;
      sg_PARTIDO: string;
      dt_ULTIMA_ATUALIZACAO: number;
      sg_UE: string;
    },
  ];
  partido: {
    numero: number;
    sigla: string;
    nome: string;
  };
  eleicao: {
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
  };
  emails: [
    string,
  ];
  sites: [];
  arquivos: [
    {
      idArquivo: number;
      nome: string;
      url: string;
      tipo: string;
      codTipo: string;
      fullFilePath: null;
      fileInputStream: null;
      fileByteArray: null;
    },
    {
      idArquivo: number;
      nome: string;
      url: string;
      tipo: string;
      codTipo: string;
      fullFilePath: null;
      fileInputStream: null;
      fileByteArray: null;
    },
    {
      idArquivo: number;
      nome: string;
      url: string;
      tipo: string;
      codTipo: string;
      fullFilePath: null;
      fileInputStream: null;
      fileByteArray: null;
    },
    {
      idArquivo: number;
      nome: string;
      url: string;
      tipo: string;
      codTipo: string;
      fullFilePath: null;
      fileInputStream: null;
      fileByteArray: null;
    },
    {
      idArquivo: number;
      nome: string;
      url: string;
      tipo: string;
      codTipo: string;
      fullFilePath: null;
      fileInputStream: null;
      fileByteArray: null;
    },
  ];
  eleicoesAnteriores: [
    {
      nrAno: number;
      id: string;
      nomeUrna: string;
      nomeCandidato: string;
      idEleicao: string;
      sgUe: string;
      local: string;
      cargo: string;
      partido: string;
      situacaoTotalizacao: string;
      txLink: string;
    },
    {
      nrAno: number;
      id: string;
      nomeUrna: string;
      nomeCandidato: string;
      idEleicao: string;
      sgUe: string;
      local: string;
      cargo: string;
      partido: string;
      situacaoTotalizacao: string;
      txLink: string;
    },
    {
      nrAno: number;
      id: string;
      nomeUrna: string;
      nomeCandidato: string;
      idEleicao: string;
      sgUe: string;
      local: string;
      cargo: string;
      partido: string;
      situacaoTotalizacao: string;
      txLink: string;
    },
    {
      nrAno: number;
      id: string;
      nomeUrna: string;
      nomeCandidato: string;
      idEleicao: string;
      sgUe: string;
      local: string;
      cargo: string;
      partido: string;
      situacaoTotalizacao: string;
      txLink: string;
    },
  ];
  substituto: null;
  motivos: null;
  codigoSituacaoCandidato: number;
  descricaoSituacaoCandidato: string;
  isCandidatoInapto: boolean;
  codigoSituacaoPartido: string;
  descricaoSituacaoPartido: string;
  isCandFechado: boolean;
  st_SUBSTITUIDO: string;
  cnpjcampanha: string;
  gastoCampanha: number;
  st_MOTIVO_FICHA_LIMPA: boolean;
  st_MOTIVO_ABUSO_PODER: boolean;
  st_MOTIVO_COMPRA_VOTO: boolean;
  st_MOTIVO_CONDUTA_VEDADA: boolean;
  st_MOTIVO_GASTO_ILICITO: boolean;
  ds_MOTIVO_OUTROS: null;
  st_MOTIVO_AUSENCIA_REQUISITO: boolean;
  st_MOTIVO_IND_PARTIDO: boolean;
  st_DIVULGA: true;
  st_DIVULGA_BENS: true;
  st_REELEICAO: boolean;
  st_DIVULGA_ARQUIVOS: boolean;
  descricaoNaturalidade: string;
}

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
