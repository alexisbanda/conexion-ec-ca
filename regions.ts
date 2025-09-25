import regionsData from './regions.config.json';

export interface RegionInfo {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  priority?: number;
  changefreq?: string;
  lastmod?: string;
}

export const regions: RegionInfo[] = (regionsData as RegionInfo[]).map(r => ({
  ...r,
  lastmod: r.lastmod || new Date().toISOString().split('T')[0]
}));

export const getRegion = (slug?: string) => regions.find(r => r.slug === slug);

export const regionSlugs = regions.map(r => r.slug);