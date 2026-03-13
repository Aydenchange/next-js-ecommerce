import { notFound } from "next/navigation";
import PageHeader from "../../../_components/PageHeader";
import ProductForm from "../../_components/ProductForm";
import { db } from "@/db/db";
import { updateProduct } from "@/app/admin/_action/products";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      description: true,
      filePath: true,
      imagePath: true,
    },
  });

  if (product == null) return notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <>
      <PageHeader>
        <div className="flex justify-center">Edit Product</div>
      </PageHeader>
      <ProductForm
        product={{
          name: product.name,
          priceInCents: product.priceInCents,
          description: product.description,
          filePath: product.filePath,
          imagePath: product.imagePath,
        }}
        action={action}
      />
    </>
  );
}
