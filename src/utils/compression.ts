import { deflate, inflate } from 'pako';

export const compressData = (data: string): string => {
  try {
    const compressed = deflate(data, { to: 'string' });
    return btoa(compressed);
  } catch (error) {
    console.error('Compression failed:', error);
    return data;
  }
};

export const decompressData = (data: string): string => {
  try {
    const decompressed = inflate(atob(data), { to: 'string' });
    return decompressed;
  } catch (error) {
    console.error('Decompression failed:', error);
    return data;
  }
}; 