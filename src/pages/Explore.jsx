import { useMemo } from 'react'
import Papa from 'papaparse'

const SAMPLE_CSV = `reference,theme,note
2 Nephi 31:4–21,Doctrine of Christ,Structural chapter on the path
3 Nephi 11:32–41,Baptism & Holy Ghost,Christ teaches Nephites
Moroni 6:1–9,Church & ordinances,How baptism is administered`

export default function Explore() {
  const { rows, fields, error } = useMemo(() => {
    const parsed = Papa.parse(SAMPLE_CSV, {
      header: true,
      skipEmptyLines: true,
    })
    return {
      rows: parsed.data,
      fields: parsed.meta.fields ?? [],
      error: parsed.errors[0]?.message ?? null,
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-amber-950">
          Explore
        </h1>
        <p className="mt-2 text-stone-700">
          Below is a live parse of an inline CSV string using{' '}
          <strong>Papa Parse</strong>. Drop in your own data the same way, or
          load a file with <code className="text-sm">Papa.parse(file, …)</code>.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          Parse note: {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-amber-900/10 bg-white/70 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="bg-amber-900/10 text-xs font-semibold uppercase tracking-wide text-amber-950">
              <tr>
                {fields.map((field) => (
                  <th key={field} className="px-4 py-3">
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10">
              {rows.map((row, i) => (
                <tr key={i} className="text-stone-800">
                  {fields.map((field) => (
                    <td key={field} className="px-4 py-3 align-top">
                      {row[field] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-stone-500">
        Tip: put <code className="text-stone-700">data.csv</code> in{' '}
        <code className="text-stone-700">public/</code>, then{' '}
        <code className="text-stone-700">fetch(&apos;/data.csv&apos;)</code>{' '}
        and pass the text to Papa Parse.
      </p>
    </div>
  )
}
