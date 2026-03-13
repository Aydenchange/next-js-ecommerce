"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import { useState } from "react";
import { addProduct, type AddProductFormState } from "../../_action/products";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";

type ProductFormProps = {
  product?: {
    name: string;
    priceInCents: number;
    description: string;
    filePath?: string;
    imagePath?: string;
  };
  action?: (
    prevState: AddProductFormState,
    formData: FormData,
  ) => Promise<AddProductFormState | void>;
};

export default function ProductForm({
  product,
  action: formAction,
}: ProductFormProps) {
  const [priceInCents, setPriceInCents] = useState<number>(
    product?.priceInCents ?? 0,
  );
  const isEditMode = product != null;
  const [state, action] = useActionState<AddProductFormState, FormData>(
    async (prevState, formData) => {
      const result = await (formAction ?? addProduct)(prevState, formData);
      return result ?? prevState;
    },
    { errors: {} },
  );

  return (
    <div className="flex justify-center">
      <form action={action} className="space-y-8 w-full max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            aria-invalid={state.errors?.name != null}
            required
            defaultValue={product?.name}
          />
          {state.errors?.name != null && (
            <div className="text-destructive text-sm">
              {state.errors.name[0]}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceInCents">Price In Cents</Label>
          <Input
            type="number"
            id="priceInCents"
            name="priceInCents"
            required
            aria-invalid={state.errors?.priceInCents != null}
            value={priceInCents ? priceInCents : ""}
            onChange={(e) => setPriceInCents(Number(e.target.value))}
          />
          {state.errors?.priceInCents != null && (
            <div className="text-destructive text-sm">
              {state.errors.priceInCents[0]}
            </div>
          )}
          <div className="text-muted-foreground">
            {formatCurrency((priceInCents || 0) / 100)}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            aria-invalid={state.errors?.description != null}
            defaultValue={product?.description}
          />
          {state.errors?.description != null && (
            <div className="text-destructive text-sm">
              {state.errors.description[0]}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <Input
            type="file"
            id="file"
            name="file"
            aria-invalid={state.errors?.file != null}
            required={!isEditMode}
          />
          {state.errors?.file != null && (
            <div className="text-destructive text-sm">
              {state.errors.file[0]}
            </div>
          )}
          {isEditMode && (
            <div className="text-muted-foreground text-sm">
              Leave empty to keep the current file.
            </div>
          )}
          {product?.filePath != null && (
            <a
              href={product.filePath}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 underline break-all"
            >
              {product.filePath}
            </a>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            type="file"
            id="image"
            name="image"
            aria-invalid={state.errors?.image != null}
            required={!isEditMode}
          />
          {state.errors?.image != null && (
            <div className="text-destructive text-sm">
              {state.errors.image[0]}
            </div>
          )}
          {isEditMode && (
            <div className="text-muted-foreground text-sm">
              Leave empty to keep the current image.
            </div>
          )}
          {product?.imagePath != null && (
            <Image
              src={product.imagePath}
              width={320}
              height={320}
              alt="Current product image"
              className="rounded-md border object-cover"
            />
          )}
        </div>
        <SubmitButton label={isEditMode ? "Update" : "Save"} />
      </form>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}
