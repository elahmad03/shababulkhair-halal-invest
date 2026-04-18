export async function getCycleDetailsApi(cycleId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles/${cycleId}`, {
    cache: "no-store", // always fresh (important for admin)
  });

  if (!res.ok) return null;

  const json = await res.json();
  return json.data;
}