export default function Textarea() {
    return (
      <div>
        <label htmlFor="comment" className="block text-xl font-medium text-gray-700">
          Escreva o erro no campo abaixo
        </label>
        <div className="mt-1">
          <textarea
            rows={8}
            name="comment"
            id="comment"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-500 rounded-md p-2 border-2"
            defaultValue={''}
          />
        </div>
      </div>
    )
  }
