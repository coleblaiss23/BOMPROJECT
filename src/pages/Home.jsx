export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-amber-900/10 bg-white/60 p-8 shadow-sm">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-amber-950 sm:text-4xl">
          Welcome
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-700">
          This app is your workspace for exploring the Book of Mormon through
          the lens of the doctrine of Christ — faith, repentance, baptism, the
          gift of the Holy Ghost, and enduring to the end (
          <span className="whitespace-nowrap">2&nbsp;Nephi 31</span>
          ).
        </p>
        <p className="mt-4 text-stone-600">
          Use the <strong>Explore</strong> page to try CSV parsing (Papa
          Parse) — you will plug in your own verse or study data next.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-amber-900/10 bg-white/50 p-6">
          <h2 className="font-display text-xl font-semibold text-amber-950">
            Next steps
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-stone-700">
            <li>Add CSV files to <code className="text-sm">public/</code> or import them in code.</li>
            <li>Build charts, tables, and filters on top of parsed rows.</li>
            <li>Split the app into more routes as features grow.</li>
          </ul>
        </article>
        <article className="rounded-xl border border-amber-900/10 bg-white/50 p-6">
          <h2 className="font-display text-xl font-semibold text-amber-950">
            Stack
          </h2>
          <ul className="mt-3 space-y-2 text-stone-700">
            <li>
              <strong className="text-stone-800">React Router</strong> — URLs and pages
            </li>
            <li>
              <strong className="text-stone-800">Tailwind CSS</strong> — layout and styling
            </li>
            <li>
              <strong className="text-stone-800">Papa Parse</strong> — CSV in the browser
            </li>
          </ul>
        </article>
      </section>
    </div>
  )
}
