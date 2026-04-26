import { cookies } from "next/headers";

export async function getCycleDetailsApi(cycleId: string) {
  if (!cycleId) return null;

  const url = `${process.env.NEXT_PUBLIC_API_URL}/cycles/${cycleId}`;

  const cookieStore = await cookies();

  // ✅ FIX: properly format cookies
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

console.log("Cookie header:", cookieHeader);
console.log("Fetching cycle details from:", url);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("API ERROR:", err);
    return null;
  }

  const json = await res.json();
  return json.data;
}