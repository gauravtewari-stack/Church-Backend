import slugify from 'slugify';

export class SlugUtil {
  /**
   * Generate a slug from a string
   * @param text - The text to convert to slug
   * @param options - Slugify options
   * @returns Generated slug
   */
  static generate(
    text: string,
    options?: {
      lowercase?: boolean;
      separator?: string;
      trim?: boolean;
      replacement?: string;
    },
  ): string {
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }

    const defaultOptions = {
      lowercase: true,
      separator: '-',
      trim: true,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      const slug = slugify(text, mergedOptions);

      // Remove any leading/trailing separators
      return slug.replace(/^-+|-+$/g, '');
    } catch (error) {
      throw new Error(`Failed to generate slug: ${error}`);
    }
  }

  /**
   * Validate if a string is a valid slug
   * @param slug - The slug to validate
   * @returns True if valid, false otherwise
   */
  static isValid(slug: string): boolean {
    if (!slug || typeof slug !== 'string') {
      return false;
    }

    // Slug should only contain lowercase letters, numbers, and hyphens
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  /**
   * Ensure slug uniqueness by appending a counter
   * @param baseSlug - The base slug
   * @param existingSlugs - Array of existing slugs
   * @returns A unique slug
   */
  static makeUnique(baseSlug: string, existingSlugs: string[]): string {
    if (!existingSlugs.includes(baseSlug)) {
      return baseSlug;
    }

    let counter = 1;
    let newSlug = `${baseSlug}-${counter}`;

    while (existingSlugs.includes(newSlug)) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }

    return newSlug;
  }

  /**
   * Normalize a slug to ensure consistency
   * @param slug - The slug to normalize
   * @returns Normalized slug
   */
  static normalize(slug: string): string {
    if (!slug || typeof slug !== 'string') {
      return '';
    }

    return slug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Convert slug back to readable text
   * @param slug - The slug to convert
   * @returns Readable text
   */
  static toReadable(slug: string): string {
    if (!slug || typeof slug !== 'string') {
      return '';
    }

    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Batch generate slugs with uniqueness check
   * @param texts - Array of texts to convert
   * @returns Array of unique slugs
   */
  static generateBatch(texts: string[]): string[] {
    const slugs: string[] = [];
    const usedSlugs = new Set<string>();

    for (const text of texts) {
      let slug = this.generate(text);

      if (usedSlugs.has(slug)) {
        slug = this.makeUnique(slug, Array.from(usedSlugs));
      }

      usedSlugs.add(slug);
      slugs.push(slug);
    }

    return slugs;
  }

  /**
   * Extract slug from URL path
   * @param path - The URL path
   * @returns The slug
   */
  static extractFromPath(path: string): string | null {
    if (!path || typeof path !== 'string') {
      return null;
    }

    const parts = path.split('/').filter((p) => p);
    return parts.length > 0 ? parts[parts.length - 1] : null;
  }

  /**
   * Compare two slugs for equality
   * @param slug1 - First slug
   * @param slug2 - Second slug
   * @returns True if slugs are equivalent
   */
  static areEqual(slug1: string, slug2: string): boolean {
    return this.normalize(slug1) === this.normalize(slug2);
  }

  /**
   * Generate slug with namespace
   * @param namespace - The namespace
   * @param text - The text
   * @returns Namespaced slug
   */
  static generateNamespaced(namespace: string, text: string): string {
    const namespacePart = this.generate(namespace);
    const textPart = this.generate(text);
    return `${namespacePart}/${textPart}`;
  }
}
