import { createClient } from '@/app/utils/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  
  // We tell TypeScript what columns to expect: id and title
  const { data: notes } = await supabase
    .from('notes')
    .select('id, title');

  return (
    <main className="p-10 ml-0 lg:ml-64">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Database Notes</h1>
      <ul className="space-y-2">
        {notes?.map((note: { id: number; title: string }) => (
          <li key={note.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            {note.title}
          </li>
        ))}
      </ul>
    </main>
  );
}