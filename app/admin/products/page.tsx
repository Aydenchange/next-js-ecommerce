import { Button } from "@/components/ui/button";
import PageHeader from "../_components/PageHeader";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Product</PageHeader>
        <Button>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
      <ProductTable />
    </>
  );
}

function ProductTable() {
  return (
    <>
      <Table>
        <TableCaption>Product List</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-0">
              <span className="sr-only">Available For Purchase</span>
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="w-0">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody></TableBody>
      </Table>
    </>
  );
}
