export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bullet"
  | "numbered"
  | "todo"
  | "quote"
  | "divider"
  | "callout";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface PageSummary {
  id: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PageDetail extends PageSummary {
  blocks: Block[];
}

export const defaultBlocks = (): Block[] => [
  { id: `block-${Date.now()}`, type: "paragraph", content: "" },
];
