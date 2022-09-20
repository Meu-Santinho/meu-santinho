export default function HeaderSection(props: {
  title: string;
  subTitle: string;
}) {
  return (
    <div class="bg-white text-center">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <p class="max-w-xl text-center text-xl text-gray-500">
            Selecione os candidatos que você vai votar e gere seu santinho
            online. Compartilhe no Instagram e peça sugestões para os cargos que
            você não escolheu ainda!
          </p>
        </div>
      </div>
    </div>
  );
}
