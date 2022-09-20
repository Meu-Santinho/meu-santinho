const navigation = [
  { name: "Contato", href: "/contato" },
  { name: "Home", href: "/" },
];

export default function Navigator() {
  return (
    <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
      {navigation.map((link) => (
        <a
          key={link.href}
          href={link.href}
          class="border-transparent text-white hover:border-gray-300 hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
}
