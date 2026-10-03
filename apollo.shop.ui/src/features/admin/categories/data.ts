import type { CategoryTree } from "@/types/api";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  depth: number;
  parentId: string | null;
  parentName: string | null;
  childrenCount: number;
};

export function flattenCategories(
  nodes: CategoryTree[],
  depth = 0,
  parentId: string | null = null,
  parentName: string | null = null,
): CategoryRow[] {
  return nodes.flatMap((node) => {
    const children = node.children || [];
    const row: CategoryRow = {
      id: node.id,
      name: node.name,
      slug: node.slug,
      description: node.description,
      sortOrder: node.sortOrder,
      isActive: node.isActive,
      depth,
      parentId,
      parentName,
      childrenCount: children.length,
    };
    return [
      row,
      ...flattenCategories(children, depth + 1, node.id, node.name),
    ];
  });
}
