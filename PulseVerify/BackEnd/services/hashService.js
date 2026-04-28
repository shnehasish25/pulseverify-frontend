import { Jimp } from "jimp";

/**
 * Computes a 64-bit Perceptual Hash (pHash) of an image from a URL or Buffer.
 * 
 * @param {string|Buffer} imageSource URL or Buffer of the image
 * @returns {Promise<string>} 64-bit binary string representing the hash
 */
export const generatePHash = async (imageSource) => {
  try {
    const image = await Jimp.read(imageSource);
    
    // Resize and greyscale for consistent hashing
    image.resize({ w: 32, h: 32 }).greyscale();
    
    // Jimp has a built-in pHash method
    const hash = image.hash(2); // base 2 (binary string)
    
    return hash;
  } catch (error) {
    console.error("Error generating pHash:", error);
    throw new Error("Failed to compute image hash");
  }
};

/**
 * Calculates the Hamming distance between two binary hashes.
 * Lower distance means images are more similar.
 * 
 * @param {string} hash1 First binary hash string
 * @param {string} hash2 Second binary hash string
 * @returns {number} The hamming distance (number of differing bits)
 */
export const calculateHammingDistance = (hash1, hash2) => {
  if (hash1.length !== hash2.length) {
    throw new Error("Hashes must be of the same length to compare");
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }
  return distance;
};
