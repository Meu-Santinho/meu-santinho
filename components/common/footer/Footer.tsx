/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";

const navigation = {
  usuarios: [
    { id: "soutofernando", href: "https://github.com/soutofernando" },
    { id: "lucis", href: "https://github.com/lucis" },
    { id: "marianacoimbra", href: "https://github.com/marianacoimbra" },
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
    <footer class={tw`aria-labelledby="footer-heading bg-black`}>
      <h2 id="footer-heading" class={tw`sr-only`}>
        Footer
      </h2>
      <div class={tw`max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8`}>
        <div class={tw`xl:grid xl:grid-cols-3 xl:gap-8`}>
          <div class={tw`space-y-8 xl:col-span-1`}>
            <h1
              class={tw`mt-1 text-md font-extrabold text-white sm:text-md sm:tracking-tight lg:text-xl`}
            >
              Meu Santinho
            </h1>
            <div class={tw`flex`}>
              <p class={tw`text-white text-base mr-4`}>
                GitHub
              </p>
              <div class={tw`flex `}>
                {navigation.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    class={tw`text-gray-400 hover:text-gray-500`}
                  >
                    <span class={tw`sr-only`}>{item.name}</span>
                    <item.icon class={tw`h-6 w-6`} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div class={tw`mt-12 border-t border-white pt-8`}>
          <p class={tw`text-base text-white xl:text-center sm:flex block`}>
            &copy; 2022 desenvolvido por &nbsp;
            {navigation.usuarios.map((user) => (
              <button
                class={tw`flex align-center items-center mr-2 hover:underline hover:text-white hover:transition-all mt-1 sm:mt-0`}
                href={user.href}
              >
                <a href={user.href} class={tw`flex items-center align-center`}>
                  {navigation.social.map((item) => (
                    <a
                      key={item.name}
                      href={user.href}
                      class={tw`text-gray-400 hover:text-gray-500`}
                    >
                      <span class={tw`sr-only`}>{item.name}</span>
                      <item.icon class={tw`h-6 w-6`} aria-hidden="true" />
                    </a>
                  ))}
                  {`${user.id}`}
                </a>
              </button>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
