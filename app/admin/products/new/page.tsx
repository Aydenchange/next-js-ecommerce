import PageHeader from "../../_components/PageHeader";
import ProductForm from "../_components/ProductForm";

export default function ProductAddForm() {
  return (
    <>
      <PageHeader>
        <div className="flex justify-center">Add Product</div>
      </PageHeader>
      <ProductForm />
    </>
  );
}
