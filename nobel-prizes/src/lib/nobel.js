import Fetch from "@11ty/eleventy-fetch";

const API_BASE = "https://api.nobelprize.org/2.1";
const PAGE_SIZE = 100;

async function fetchAllPages(endpoint, collectionKey) {
  const records = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = new URL(`${API_BASE}/${endpoint}`);
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("offset", String(offset));

    const response = await Fetch(url.toString(), {
      duration: "1d",
      type: "json",
      directory: ".cache",
    });

    const page = response[collectionKey];

    if (!Array.isArray(page)) {
      throw new Error(`Unexpected API response from ${endpoint}`);
    }

    records.push(...page);

    if (page.length < PAGE_SIZE) {
      break;
    }
  }

  return records;
}

export async function getNobelData() {
  const [prizes, laureates] = await Promise.all([
    fetchAllPages("nobelPrizes", "nobelPrizes"),
    fetchAllPages("laureates", "laureates"),
  ]);

  return { prizes, laureates };
}
