const ids = process.argv.slice(2);
const check = async (u) => {
  try {
    const r = await fetch(u, { method: 'GET', headers: { Range: 'bytes=0-1024' } });
    return r.status;
  } catch (e) {
    return 'ERR ' + e.message;
  }
};
for (const id of ids) {
  const u = id.startsWith('http') ? id : `https://images.unsplash.com/photo-${id}?w=200`;
  const s = await check(u);
  console.log(`${s}\t${u}`);
}