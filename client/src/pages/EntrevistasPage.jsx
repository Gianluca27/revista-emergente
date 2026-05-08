import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CategoryFilter from "../components/ui/CategoryFilter";
import PublicationCard from "../components/ui/PublicationCard";
import SkeletonCard from "../components/ui/SkeletonCard";
import { getPublications, getCategories } from "../services/publications";

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const LIMIT = 9;

export default function EntrevistasPage() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [publications, setPublications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCategories()
      .then((data) =>
        setCategories(Array.isArray(data) ? data : (data.data ?? [])),
      )
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getPublications({
      page,
      limit: LIMIT,
      ...(activeCategory?.slug ? { category: activeCategory.slug } : {}),
    })
      .then((data) => {
        const items = Array.isArray(data) ? data : (data.data ?? []);
        const pag = Array.isArray(data)
          ? { page, limit: LIMIT, total: data.length, totalPages: 1 }
          : (data.pagination ?? {
              page,
              limit: LIMIT,
              total: items.length,
              totalPages: 1,
            });
        setPublications(items);
        setPagination(pag);
      })
      .catch(() => {
        setPublications([]);
        setPagination({ page, limit: LIMIT, total: 0, totalPages: 1 });
      })
      .finally(() => setLoading(false));
  }, [page, activeCategory]);

  function handleCategorySelect(catId) {
    const cat =
      catId === null
        ? null
        : (categories.find((c) => (c.id ?? c) === catId) ?? null);
    setActiveCategory(cat);
    setPage(1);
  }

  function handlePrev() {
    if (page > 1) setPage((p) => p - 1);
  }

  function handleNext() {
    if (page < pagination.totalPages) setPage((p) => p + 1);
  }

  const gridKey = `${page}-${activeCategory?.id ?? "all"}`;

  return (
    <div className="min-h-screen bg-crema">
      {/* Page header */}
      <div className="pt-24 pb-8 px-6 border-b border-gris-mid">
        <p className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-3">
          — Publicaciones
        </p>
        <h1
          className="font-display text-6xl sm:text-8xl text-negro uppercase leading-none glitch"
          data-text="Entrevistas"
        >
          Entrevistas
        </h1>
        <div className="mt-4 h-[2px] w-16 bg-rojo" />
        <p className="font-mono text-lg text-negro/90 mt-4">
          Conversaciones con artistas, sellos y colectivos de la escena
          emergente.
        </p>
      </div>

      {/* Category filter */}
      <div className="px-6 py-6 border-b border-gris-mid">
        <CategoryFilter
          categories={categories}
          active={activeCategory?.id ?? null}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* Grid */}
      <div className="px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="bg-crema">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-mono text-lg text-negro/90">
              No hay publicaciones en esta categoría todavía.
            </p>
          </div>
        ) : (
          <motion.div
            key={gridKey}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {publications.map((pub) => (
              <motion.div
                key={pub.id}
                variants={cardVariants}
                className="bg-crema"
              >
                <PublicationCard
                  title={pub.title}
                  subtitle={pub.subtitle}
                  category={pub.category?.name ?? pub.category_name ?? null}
                  coverImage={pub.cover_image}
                  slug={pub.slug}
                  date={pub.published_at}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 px-6 pb-16">
          <button
            onClick={handlePrev}
            disabled={page <= 1}
            className="font-ui text-base uppercase tracking-widest px-5 py-2 border border-gris-mid text-negro hover:border-rojo hover:text-rojo transition-colors duration-150 disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Anterior
          </button>
          <span className="font-mono text-base text-negro/90">
            Página {pagination.page ?? page} de {pagination.totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page >= pagination.totalPages}
            className="font-ui text-base uppercase tracking-widest px-5 py-2 border border-gris-mid text-negro hover:border-rojo hover:text-rojo transition-colors duration-150 disabled:opacity-30 disabled:pointer-events-none"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
