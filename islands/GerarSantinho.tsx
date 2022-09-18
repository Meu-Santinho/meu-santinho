/** @jsx h */
import { useEffect } from "preact/hooks";
import { h } from "preact";
import { tw } from "@twind";
import { template } from "../utils/template.js";

export default function GerarSantinho() {
  useEffect(() => {
    const canvas = document.createElement("canvas");

    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    // Colocar template no canva
    const img = new Image(); // Create new img element
    img.src = template;

    ctx?.drawImage(img, 0, 1, 1080, 1920);
    ctx?.drawImage(img, 0, 1, 1080, 1920);

    const candidatos = {
      depEstadual: {
        nome: "Zezinho de Iraçuba",
        imageUrl:
          "https://divulgacandcontas.tse.jus.br/candidaturas/oficial/2022/BR/BA/546/candidatos/910005/foto.jpeg",
        numero: "25168",
      },
      depFederal: {
        nome: "Frei Damião",
        imageUrl:
          "https://divulgacandcontas.tse.jus.br/candidaturas/oficial/2022/BR/BA/546/candidatos/910005/foto.jpeg",
        numero: "2516",
      },
      senador: {
        nome: "Veneziano",
        imageUrl:
          "https://divulgacandcontas.tse.jus.br/candidaturas/oficial/2022/BR/BA/546/candidatos/910005/foto.jpeg",
        numero: "400",
      },
      governador: {
        nome: "João Azevedo",
        imageUrl:
          "https://divulgacandcontas.tse.jus.br/candidaturas/oficial/2022/BR/BA/546/candidatos/910005/foto.jpeg",
        numero: "40",
      },
      presidente: {
        nome: "Lula",
        imageUrl:
          "https://divulgacandcontas.tse.jus.br/candidaturas/oficial/2022/BR/BA/546/candidatos/910005/foto.jpeg",
        numero: "13",
      },
    };

    const preencheCandidato = ({
      yNome,
      yNumero,
      nome,
      numero,
      yImage,
      imageUrl,
    }) => {
      if (!ctx) {
        return;
      }
      ctx.fillStyle = "#FFFFFF";

      const fontSize = nome.length > 15 ? "64" : "90";

      ctx.font = `bold ${fontSize}px 'Source Sans Pro'`;

      ctx.fillText(nome, 393, yNome);
      ctx.fillStyle = "#004258";
      ctx.font = `bold 128px 'Source Sans Pro'`;

      numero.split("").forEach((algarismo, i) => {
        ctx.fillText(algarismo, 410 + i * 135, yNumero);
      });
    };
    [
      { yNome: 165, yNumero: 320, ...candidatos.depEstadual, yImage: 165 },
      { yNome: 525, yNumero: 670, ...candidatos.depFederal, yImage: 165 },
      { yNome: 885, yNumero: 1015, ...candidatos.senador, yImage: 165 },
      { yNome: 1230, yNumero: 1370, ...candidatos.governador, yImage: 165 },
      { yNome: 1590, yNumero: 1715, ...candidatos.presidente, yImage: 165 },
    ].forEach(preencheCandidato);
    var output = new Image();
    output.src = canvas.toDataURL();
    const div = document.querySelector("#output");
    output.style.width = "100%";

    div?.appendChild(output);
  }, []);

  return (
    <div>
      <div style="display: flex; justify-content: center;">
        <div
          id="output"
          style="width: 300px; height: 533px; background-color: #069;"
        ></div>
      </div>
      <img />
      <button>Compartilhar</button>
    </div>
  );
}
