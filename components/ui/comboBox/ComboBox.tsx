/** @jsx h */
import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { Combobox } from "headlessui";

const people = [
  { name: "Leslie Alexander", username: "@lesliealexander" },
  // More users...
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function ComboBoxSelect() {
  const [query, setQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState();

  const filteredPeople = query === "" ? people : people.filter((person) => {
    return person.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <Combobox as="div" value={selectedPerson} onChange={setSelectedPerson}>
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        Assigned to
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(person) => person.name}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          {/* <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /> */}
        </Combobox.Button>
        {filteredPeople.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <div>
              {filteredPeople.map((person) => (
                <Combobox.Option
                  key={person.username}
                  value={person}
                  className={({ active }) =>
                    classNames(
                      "relative cursor-default select-none py-2 pl-3 pr-9",
                      active ? "bg-indigo-600 text-white" : "text-gray-900",
                    )}
                >
                  {({ active, selected }: any) => (
                    <div>
                      <div className="flex">
                        <span
                          className={classNames(
                            "truncate",
                            selected && "font-semibold",
                          )}
                        >
                          {person.name}
                        </span>
                        <span
                          className={classNames(
                            "ml-2 truncate text-gray-500",
                            active ? "text-indigo-200" : "text-gray-500",
                          )}
                        >
                          {person.username}
                        </span>
                      </div>

                      {selected && (
                        <span
                          className={classNames(
                            "absolute inset-y-0 right-0 flex items-center pr-4",
                            active ? "text-white" : "text-indigo-600",
                          )}
                        >
                          {/* <CheckIcon className="h-5 w-5" aria-hidden="true" /> */}
                        </span>
                      )}
                    </div>
                  )}
                </Combobox.Option>
              ))}
            </div>
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
