import { getCategories, getTags } from '../controllers/offers';

export const validateTags = async (tagIds: string[]) => {
  const existingTags = await getTags();
  return tagIds.every((tagId) => existingTags.some((tag) => tag.id === tagId));
};

export const validateCategory = async (categoryId: string) => {
  const existingCategories = await getCategories();
  return existingCategories.some((category) => category.id === categoryId);
}