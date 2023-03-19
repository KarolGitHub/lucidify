import { Item } from "@/server/models/Item";

const fromJsonMap = (itemDoc: any, idDocument: string): Item | undefined => {
  if (itemDoc == null) return {};
  const item: Item = {};
  item.id = idDocument;
  item.name = itemDoc.name ?? "";
  item.color = itemDoc.color ?? "";
  item.price = itemDoc.price ?? 0;
  item.image = itemDoc.image ?? "";
  return item;
};

export default fromJsonMap;
