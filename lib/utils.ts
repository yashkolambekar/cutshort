import { characters, numberOfCharacters } from "./constants";

const safeSlugLength = (linksCount: number) => {
    const safeLength = Math.ceil(Math.log(linksCount + 1) / Math.log(numberOfCharacters))
    return safeLength;
}
const randomSlugGenerator = (length: number, excludedSlugs: string[] = []): string => {
    const maxAttempts = 100; // Prevent infinite loops
    const excludedSet = new Set(excludedSlugs); // Faster lookups
    
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        let slug = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * numberOfCharacters);
            slug += characters[randomIndex];
        }

        if (!excludedSet.has(slug)) {
            return slug;
        }
    }
    
    // If we've exhausted all attempts, throw an error
    throw new Error(`Failed to generate unique slug of length ${length} after ${maxAttempts} attempts`);
};

export { safeSlugLength, randomSlugGenerator };