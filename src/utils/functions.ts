import { getCategories, getTags } from '../controllers/offers';
import bcrypt from 'bcrypt';

/**
 * Validate if a list of tag IDs exist in the database
 * @param tagIds - List of tag IDs to validate
 * @returns {Promise<boolean>} - True if all tag IDs exist, false otherwise
 */
export const validateTags = async (tagIds: string[]) => {
  const existingTags = await getTags();
  return tagIds.every((tagId) => existingTags.some((tag) => tag.id === tagId));
};

/**
 * Validate if a category exists
 * @param categoryId - ID of the category to validate
 * @returns {Promise<boolean>} - True if the category exists, false otherwise
 */
export const validateCategory = async (categoryId: string) => {
  const existingCategories = await getCategories();
  return existingCategories.some((category) => category.id === categoryId);
};

/**
 * Hash a password securely using bcrypt
 * @param password - Plain text password to hash
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password: string, saltRounds: number = 12): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password to verify
 * @param hashedPassword - Previously hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Failed to compare passwords');
  }
};
