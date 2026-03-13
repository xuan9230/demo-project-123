import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getRandomListing, formatListing } from "./tools/listings.js";
import { getRandomPokemon, formatPokemon } from "./tools/pokemon.js";

const server = new McpServer({
  name: "kiwicar-mcp",
  version: "1.0.0",
});

// ─── Tool: get_random_listing ─────────────────────────────────────────────────

server.tool(
  "get_random_listing",
  "Get a random active vehicle listing from the KiwiCar marketplace database",
  {},
  async () => {
    const listing = await getRandomListing();
    return {
      content: [
        {
          type: "text",
          text: formatListing(listing),
        },
      ],
    };
  }
);

// ─── Tool: get_random_pokemon ─────────────────────────────────────────────────

server.tool(
  "get_random_pokemon",
  "Get a random Pokémon from the public PokéAPI (https://pokeapi.co)",
  {},
  async () => {
    const pokemon = await getRandomPokemon();
    return {
      content: [
        {
          type: "text",
          text: formatPokemon(pokemon),
        },
      ],
    };
  }
);

// ─── Prompt: kiwi_lucky_combo ─────────────────────────────────────────────────

server.prompt(
  "kiwi_lucky_combo",
  "Generate a fun 'Kiwi Lucky Combo' pairing a random KiwiCar vehicle with a random Pokémon",
  {},
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a fun and creative assistant for KiwiCar, New Zealand's AI-powered used car marketplace.

Use the \`get_random_listing\` tool to fetch a random vehicle from our database, and the \`get_random_pokemon\` tool to fetch a random Pokémon.

Then craft a short, playful "Kiwi Lucky Combo" response that:
1. Presents the vehicle and the Pokémon side by side
2. Finds a creative thematic connection between them (e.g. matching colours, similar energy, shared traits)
3. Ends with a fun NZ-flavoured tagline

Keep it punchy and entertaining — under 200 words total.`,
        },
      },
    ],
  })
);

// ─── Start server ─────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
