type Category = { _id: string; name: string; slug: string };
type Brand = { _id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  brands: Brand[];
  values: {
    search: string;
    category: string;
    brand: string;
    audience: string;
    sort: string;
    minPrice: string;
    maxPrice: string;
    limit: number;
  };
  idPrefix?: string;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-gold/25 bg-black/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition focus:border-gold/45 focus:ring-1 focus:ring-gold/25";
const labelClass = "block text-[11px] font-medium uppercase tracking-[0.14em] text-gold/75";

export function ShopFilterForm({ categories, brands, values, idPrefix = "" }: Props) {
  const pid = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  return (
    <form method="get" action="/shop" className="space-y-6">
      <input type="hidden" name="page" value="1" />

      <div>
        <label htmlFor={pid("search")} className={labelClass}>
          Search
        </label>
        <input
          id={pid("search")}
          name="search"
          type="search"
          defaultValue={values.search}
          placeholder="Name, notes, keywords…"
          className={inputClass}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <label htmlFor={pid("category")} className={labelClass}>
            Category
          </label>
          <select id={pid("category")} name="category" defaultValue={values.category} className={inputClass}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={pid("brand")} className={labelClass}>
            Brand
          </label>
          <select id={pid("brand")} name="brand" defaultValue={values.brand} className={inputClass}>
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className={labelClass}>Collection</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              { value: "all", label: "All" },
              { value: "women", label: "Women" },
              { value: "men", label: "Men" },
              { value: "unisex", label: "Unisex" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gold/20 bg-black/35 px-3 py-1.5 text-xs text-foreground has-[:checked]:border-gold/45 has-[:checked]:bg-gold/10"
            >
              <input
                type="radio"
                name="audience"
                value={opt.value}
                defaultChecked={values.audience === opt.value || (opt.value === "all" && values.audience === "all")}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className={labelClass}>Price (Ksh)</span>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={pid("minPrice")} className="sr-only">
              Minimum price
            </label>
            <input
              id={pid("minPrice")}
              name="minPrice"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Min"
              defaultValue={values.minPrice}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={pid("maxPrice")} className="sr-only">
              Maximum price
            </label>
            <input
              id={pid("maxPrice")}
              name="maxPrice"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Max"
              defaultValue={values.maxPrice}
              className={inputClass}
            />
          </div>
        </div>
        <p className="mt-1.5 text-[11px] text-muted">Leave blank for no limit on that side.</p>
      </div>

      <div>
        <label htmlFor={pid("sort")} className={labelClass}>
          Sort by
        </label>
        <select id={pid("sort")} name="sort" defaultValue={values.sort} className={inputClass}>
          <option value="newest">Newest first</option>
          <option value="popular">Most popular</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <div>
        <label htmlFor={pid("limit")} className={labelClass}>
          Per page
        </label>
        <select id={pid("limit")} name="limit" defaultValue={String(values.limit)} className={inputClass}>
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="48">48</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          className="w-full rounded-full bg-gold py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
