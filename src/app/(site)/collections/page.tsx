import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { demoProducts } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const page = Math.max(1, Number(searchParams?.page || 1));
  const search = String(searchParams?.search || "");
  const brand = String(searchParams?.brand || "");
  const status = String(searchParams?.status || "");
  const columns = Math.min(4, Math.max(2, Number(searchParams?.columns || 4)));
  const take = 12;

  const where: any = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { brand: { contains: search, mode: "insensitive" } }
            ]
          }
        : {},
      brand
        ? {
            brand: { contains: brand, mode: "insensitive" }
          }
        : {},
      status === "sale"
        ? { salePrice: { not: null } }
        : status === "stock"
          ? { stock: { gt: 0 } }
          : {}
    ]
  };

  let products: Array<any> = [];
  let total = 0;
  try {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take
      }),
      prisma.product.count({ where })
    ]);
  } catch {
    const filtered = demoProducts.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = !brand || product.brand.toLowerCase().includes(brand.toLowerCase());
      const matchesStatus = status === "sale" ? Boolean(product.salePrice) : status === "stock" ? true : true;
      return matchesSearch && matchesBrand && matchesStatus;
    });
    products = filtered.slice((page - 1) * take, page * take);
    total = filtered.length;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">Collections</p>
        <h1 className="mt-2 font-heading text-5xl">Luxury Watches</h1>
      </div>
      <form className="mb-10 rounded-3xl border border-black/10 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_0.9fr_0.9fr]">
          <input name="search" placeholder="Search by name" defaultValue={search} className="rounded-2xl border border-black/10 px-4 py-3" />
          <div className="hidden rounded-2xl border border-black/10 px-4 py-3 lg:block">
            <div className="text-xs uppercase tracking-[0.25em] text-black/45">Choose cards per row</div>
            <div className="mt-3 flex items-center gap-2">
              {[
                { value: 2, bars: 2 },
                { value: 3, bars: 3 },
                { value: 4, bars: 4 }
              ].map((item) => (
                <a
                  key={item.value}
                  href={`/collections?${new URLSearchParams({
                    page: "1",
                    search,
                    brand,
                    status,
                    columns: String(item.value)
                  }).toString()}`}
                  className={`flex min-w-14 items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    columns === item.value ? "border-black bg-black text-white" : "border-black/10 bg-white text-black/70"
                  }`}
                  aria-label={`${item.value} cards per row`}
                >
                  <span className="flex items-end gap-1">
                    {Array.from({ length: item.bars }).map((_, index) => (
                      <span key={index} className={`block h-4 w-1 rounded-full ${columns === item.value ? "bg-white" : "bg-black/50"}`} />
                    ))}
                  </span>
                </a>
              ))}
            </div>
          </div>
          <select name="status" defaultValue={status} className="rounded-2xl border border-black/10 px-4 py-3">
            <option value="">All Status</option>
            <option value="sale">Sale</option>
            <option value="stock">In Stock</option>
          </select>
          <input type="hidden" name="brand" value={brand} />
          <input type="hidden" name="columns" value={String(columns)} />
          <button className="rounded-2xl bg-ink px-4 py-3 font-semibold text-white lg:col-span-1">Apply Filters</button>
        </div>
      </form>
      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/15 p-10 text-center text-black/60">
          No products matched your filters. Try a broader search or clear filters.
        </div>
      ) : (
        <div className={`grid grid-cols-2 gap-4 lg:gap-6 ${columns === 2 ? "lg:grid-cols-2" : columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                brand: product.brand,
                price: product.price.toString(),
                salePrice: product.salePrice?.toString() || null,
                images: Array.isArray(product.images) && product.images.length ? (product.images as string[]) : ["/watches/classic-fusion-titanium.jpg"]
              }}
            />
          ))}
        </div>
      )}
      <div className="mt-10 flex items-center justify-center gap-3">
        {Array.from({ length: Math.ceil(total / take) }).map((_, index) => (
          <a
            key={index}
            href={`/collections?${new URLSearchParams({
              page: String(index + 1),
              search,
              brand,
              status,
              columns: String(columns)
            }).toString()}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${index + 1 === page ? "bg-gold text-black" : "border border-black/10"}`}
          >
            {index + 1}
          </a>
        ))}
      </div>
    </div>
  );
}
