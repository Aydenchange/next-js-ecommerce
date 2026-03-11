"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProductForm() {
  return (
    <div className="flex justify-center">
      <form className="space-y-8 w-full max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            // defaultValue={}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceInCents">Price In Cents</Label>
          <Input
            type="number"
            id="priceInCents"
            name="priceInCents"
            required
            // value={}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <Input type="file" id="file" name="file" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input type="file" id="image" name="image" />
          {/* {product != null && (
              <Image
                src={product.imagePath}
                height="400"
                width="400"
                alt="Product Image"
              />
            )} */}
        </div>
        {/* <SubmitButton /> */}
      </form>
    </div>
  );
}
