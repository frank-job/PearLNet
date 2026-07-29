import sql from '@/app/utils/db/neon'

export default async function Page() {
  let notes: { id: number; title: string }[] = []
  try {
    const { rows } = await sql<{ id: number; title: string }>`select id, title from notes`
    notes = rows
  } catch {
    notes = []
  }

  return (
    <main className="p-10 ml-0 lg:ml-64">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Database Notes</h1>
      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            {note.title}
          </li>
        ))}
      </ul>
    </main>
  )
}