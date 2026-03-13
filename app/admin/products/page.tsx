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
import { db } from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DownloadIcon,
  PencilIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  TrashIcon,
} from "lucide-react";
import { deleteProduct, toggleProductAvailability } from "../_action/products";

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

async function ProductTable() {
  // Fetch all products from database with their order counts
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      priceInCents: true,
      filePath: true,
      isAvailableForPurchase: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

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
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.isAvailableForPurchase ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-red-600">✗</span>
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {formatCurrency(product.priceInCents / 100)}
              </TableCell>
              <TableCell>{product._count.orders}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      {product.filePath ? (
                        <DropdownMenuItem asChild>
                          <a href={product.filePath} download>
                            <DownloadIcon />
                            Download
                          </a>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled>
                          <DownloadIcon />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <PencilIcon />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className={
                          product.isAvailableForPurchase
                            ? "bg-green-100 text-green-800 focus:bg-green-200 focus:text-green-900"
                            : undefined
                        }
                      >
                        <form
                          action={toggleProductAvailability.bind(
                            null,
                            product.id,
                            !product.isAvailableForPurchase,
                          )}
                          className="w-full"
                        >
                          <button
                            type="submit"
                            role="switch"
                            aria-checked={product.isAvailableForPurchase}
                            aria-label={
                              product.isAvailableForPurchase
                                ? "Set product unavailable"
                                : "Set product available"
                            }
                            className="flex w-full items-center justify-start gap-2"
                          >
                            {product.isAvailableForPurchase ? (
                              <ToggleRightIcon className="text-green-600" />
                            ) : (
                              <ToggleLeftIcon className="text-muted-foreground" />
                            )}
                            <span>
                              {product.isAvailableForPurchase ? "已上架" : "未上架"}
                            </span>
                          </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        asChild
                        variant="destructive"
                        disabled={product._count.orders > 0}
                      >
                        <form
                          action={deleteProduct.bind(null, product.id)}
                          className="w-full"
                        >
                          <button
                            type="submit"
                            className="flex w-full items-center gap-1.5"
                          >
                            <TrashIcon />
                            Delete
                          </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
