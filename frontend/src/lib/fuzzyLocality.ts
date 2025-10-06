// Fuse.js fuzzy search config for localities
import Fuse from 'fuse.js';
export function getFuzzyLocalitySuggestions(localities: string[], query: string): string[] {
  if (!query.trim()) return localities.slice(0, 20);
  const fuse = new Fuse(localities, {
    threshold: 0.3,
    minMatchCharLength: 2,
    ignoreLocation: true,
  });
  return fuse.search(query).map(result => result.item);
}
