import Image from "next/image";
import Link from "next/link";
import { db } from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AutoRefreshProducts from "./_components/AutoRefreshProducts";

export default async function HomePage() {
  const products = await db.product.findMany({
    where: { isAvailableForPurchase: true },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      description: true,
      imagePath: true,
    },
    orderBy: { name: "asc" },
  });

  if (products.length === 0) {
    return (
      <>
        <AutoRefreshProducts />
        <p className="py-20 text-center text-muted-foreground">
          No products available yet.
        </p>
      </>
    );
  }

  return (
    <>
      <AutoRefreshProducts />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col overflow-hidden">
            <div className="relative aspect-video w-full bg-muted">
              <Image
                src={product.imagePath}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>
                {formatCurrency(product.priceInCents / 100)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/products/${product.id}/purchase`}>Buy Now</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
