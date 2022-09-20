const navigation = {
  usuarios: [
    { id: "Fernando Souto", href: "https://github.com/soutofernando" },
    { id: "Lucis", href: "https://github.com/lucis" },
    { id: "Mariana Coimbra", href: "https://github.com/marianacoimbra" },
  ],
  social: [
    {
      name: "GitHub",
      href: "https://github.com/lucis/meu-santinho",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
};

export default function Footer() {
  return (
    <footer class="bg-gray mt-40 py-16	">
      <div class={`flex items-center align-center flex-col`}>
        <img src="/VectorFooter.svg" class="w-10/12 h-6 mb-10"></img>
        <div>
          <div class="flex">
            <p class="text-white text-base mr-2">
              Este projeto tem o código aberto no Github
            </p>
            <div class="flex text-gray-400">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  class="text-gray-400 hover:text-gray-500"
                >
                  <span class="sr-only">{item.name}</span>
                  <item.icon class="h-6 w-6 text-gray-400" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center align-center flex-col">
        <p class="text-base text-white xl:text-center sm:flex block">
          Desenvolvido por:
        </p>
        <div class="flex items-center align-center">
          {navigation.usuarios.map((user) => (
            <button
              class="flex align-center items-center mr-2 hover:underline hover:text-white hover:transition-all mt-1 sm:mt-0"
              href={user.href}
            >
              <a
                href={user.href}
                class="flex items-center align-center text-white font-light mr-2 my-4"
              >
                {navigation.social.map((item) => (
                  <a
                    key={item.name}
                    href={user.href}
                    class="text-gray-400 hover:text-gray-500 flex items-start font-light"
                  >
                    <span class="sr-only">{item.name}</span>
                  </a>
                ))}
                {`${user.id}`}
              </a>
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
