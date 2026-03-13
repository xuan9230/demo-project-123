const POKEAPI_BASE = "https://pokeapi.co/api/v2";

export interface Pokemon {
  id: number;
  name: string;
  height: number; // decimetres
  weight: number; // hectograms
  types: string[];
  sprite: string | null;
  stats: { name: string; value: number }[];
}

export async function getRandomPokemon(): Promise<Pokemon> {
  // Step 1: Get total pokemon count
  const countRes = await fetch(`${POKEAPI_BASE}/pokemon?limit=1`);
  if (!countRes.ok) throw new Error(`PokeAPI error fetching count: ${countRes.status}`);
  const { count } = (await countRes.json()) as { count: number };

  // Step 2: Pick a random ID (IDs are 1-based)
  const randomId = Math.floor(Math.random() * count) + 1;

  // Step 3: Fetch that pokemon
  const pokeRes = await fetch(`${POKEAPI_BASE}/pokemon/${randomId}`);
  if (!pokeRes.ok) throw new Error(`PokeAPI error fetching pokemon ${randomId}: ${pokeRes.status}`);

  const data = (await pokeRes.json()) as {
    id: number;
    name: string;
    height: number;
    weight: number;
    types: { type: { name: string } }[];
    sprites: { front_default: string | null };
    stats: { base_stat: number; stat: { name: string } }[];
  };

  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types: data.types.map((t) => t.type.name),
    sprite: data.sprites.front_default,
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  };
}

export function formatPokemon(pokemon: Pokemon): string {
  const heightM = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);
  const types = pokemon.types.join(" / ");
  const stats = pokemon.stats
    .map((s) => `  ${s.name}: ${s.value}`)
    .join("\n");

  return [
    `⚡ **#${pokemon.id} ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}**`,
    `🔷 Type: ${types}`,
    `📏 Height: ${heightM}m  |  ⚖️  Weight: ${weightKg}kg`,
    `📊 Base stats:\n${stats}`,
    pokemon.sprite ? `\n🖼️  ${pokemon.sprite}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
