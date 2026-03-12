"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { useState } from "react";
import { addProduct, type AddProductFormState } from "../../_action/products";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";

export default function ProductForm() {
  const [priceInCents, setPriceInCents] = useState<number>(0);
  const [state, action] = useActionState<AddProductFormState, FormData>(
    addProduct,
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
            // defaultValue={}
          />
          {state.errors?.name != null && (
            <div className="text-destructive text-sm">{state.errors.name[0]}</div>
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
          />
          {state.errors?.file != null && (
            <div className="text-destructive text-sm">{state.errors.file[0]}</div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            type="file"
            id="image"
            name="image"
            aria-invalid={state.errors?.image != null}
          />
          {state.errors?.image != null && (
            <div className="text-destructive text-sm">{state.errors.image[0]}</div>
          )}
          {/* {product != null && (
              <Image
                src={product.imagePath}
                height="400"
                width="400"
                alt="Product Image"
              />
            )} */}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
