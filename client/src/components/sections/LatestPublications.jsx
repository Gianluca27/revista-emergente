import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicationCard from "../ui/PublicationCard";
import SkeletonCard from "../ui/SkeletonCard";
import { getPublications } from "../../services/publications";

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LatestPublications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublications({ limit: 6 })
      .then((data) =>
        setPublications(Array.isArray(data) ? data : (data.publications ?? [])),
      )
      .catch(() => setPublications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="px-6 sm:px-10 py-20 bg-crema">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-2">
            — Últimas publicaciones
          </p>
          <h2
            className="font-display text-5xl sm:text-6xl text-negro uppercase leading-none glitch"
            data-text="Entrevistas"
          >
            Entrevistas
          </h2>
        </div>
        <Link
          to="/entrevistas"
          className="hidden sm:inline-flex font-ui text-xl font-bold tracking-widest uppercase text-negro/90 hover:text-rojo transition-colors duration-200 pb-1 border-b border-gris-mid hover:border-rojo"
        >
          Ver todas →
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-crema">
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : publications.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-lg text-negro/90">
            No hay publicaciones disponibles.
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gris-mid"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
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
                category={pub.category_name ?? pub.category}
                coverImage={pub.cover_image}
                slug={pub.slug}
                date={pub.published_at}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Mobile ver todas */}
      <div className="mt-8 sm:hidden text-center">
        <Link
          to="/entrevistas"
          className="font-ui text-base tracking-widest uppercase text-negro/90 hover:text-rojo transition-colors duration-200"
        >
          Ver todas las entrevistas →
        </Link>
      </div>
    </section>
  );
}
