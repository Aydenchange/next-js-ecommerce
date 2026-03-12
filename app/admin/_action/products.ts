"use server";

import { z } from "zod";
import path from "path";
import fs from "fs";
import { db } from "@/db/db";
import { redirect } from "next/navigation";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/"),
);

// zod schema for incoming product data; price is coerced from a string
const productSchema = z.object({
  name: z.string().min(1, "name is required"),
  priceInCents: z.preprocess((val) => {
    if (typeof val === "string" || typeof val === "number") {
      return parseInt(String(val), 10);
    }
    return val;
  }, z.number().int().nonnegative("price must be a non‑negative integer")),
  description: z.string().min(1, "description is required"),
  file: fileSchema.refine((file) => file.size > 0, "Required"),
  image: imageSchema.refine((file) => file.size > 0, "Required"),
});

export type AddProductFormState = {
  errors?: {
    name?: string[];
    priceInCents?: string[];
    description?: string[];
    file?: string[];
    image?: string[];
  };
};

export async function addProduct(
  _prevState: AddProductFormState,
  formData: FormData,
) {
  // validate form data against the schema
  const result = productSchema.safeParse({
    name: formData.get("name"),
    priceInCents: formData.get("priceInCents"),
    description: formData.get("description"),
    file: formData.get("file"),
    image: formData.get("image"),
  });

  if (!result.success) {
    const errors: NonNullable<AddProductFormState["errors"]> = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field !== "string") continue;

      const current = errors[field as keyof typeof errors] ?? [];
      errors[field as keyof typeof errors] = [...current, issue.message];
    }

    return { errors } satisfies AddProductFormState;
  }

  const data = result.data;

  // helper to persist uploaded files to /public/uploads and return a URL
  async function saveFile(file?: File): Promise<string> {
    if (!file || file.size === 0) return "";
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const outPath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
    await fs.promises.writeFile(outPath, buffer);
    return `/uploads/${fileName}`;
  }

  const filePath = await saveFile(data.file as File | undefined);
  const imagePath = await saveFile(data.image as File | undefined);

  await db.product.create({
    data: {
      name: data.name,
      priceInCents: data.priceInCents,
      description: data.description,
      filePath,
      imagePath,
    },
  });

  redirect("/admin/products");
}
