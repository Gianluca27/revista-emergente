import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getPublications } from "../../services/publications";
import { formatDate } from "../../utils/formatDate";

const MARQUEE_TEXT =
  "EMERGENTE — ENTREVISTAS — MÚSICA INDEPENDIENTE — CONVERSACIONES EN PROFUNDIDAD — ";

function MarqueeTrack({ text, repeat = 4 }) {
  const content = Array.from({ length: repeat }, () => text).join("");
  return (
    <div className="overflow-hidden whitespace-nowrap py-3 border-t border-rojo/30">
      <div className="marquee-inner inline-block">
        <span className="font-display text-negro/80 text-lg sm:text-xl tracking-widest">
          {content}
          {content}
        </span>
      </div>
    </div>
  );
}

export default function EntrevistasBanner() {
  const [publication, setPublication] = useState(null);

  useEffect(() => {
    getPublications({ limit: 1 })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        if (list.length > 0) setPublication(list[0]);
      })
      .catch(() => {});
  }, []);

  return (
    <motion.section
      className="bg-rojo overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
    >
      <MarqueeTrack text={MARQUEE_TEXT} />

      <div className="px-6 sm:px-10 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        {/* Left: latest interview info */}
        <div className="flex-1">
          <p className="font-ui text-base tracking-[0.25em] text-negro/85 uppercase mb-3">
            Última entrevista
          </p>
          {publication ? (
            <>
              <h3 className="font-display text-3xl sm:text-4xl text-negro uppercase leading-tight">
                {publication.title}
              </h3>
              {publication.subtitle && (
                <p className="font-mono text-base text-negro/85 mt-2 max-w-xl leading-relaxed">
                  {publication.subtitle}
                </p>
              )}
              {publication.published_at && (
                <p className="font-mono text-base text-negro/85 mt-2">
                  {formatDate(publication.published_at)}
                </p>
              )}
            </>
          ) : (
            <h3 className="font-display text-3xl sm:text-4xl text-negro uppercase leading-tight">
              Entrevistas Emergente
            </h3>
          )}
        </div>

        {/* Right: CTA links */}
        <div className="flex flex-col gap-3">
          {publication?.slug ? (
            <Link
              to={`/entrevistas/${publication.slug}`}
              className="inline-flex items-center gap-3 font-ui text-lg tracking-widest uppercase bg-crema text-negro px-6 py-3 hover:bg-crema/80 transition-colors duration-200"
            >
              Leer entrevista →
            </Link>
          ) : null}
          <Link
            to="/entrevistas"
            className="font-ui text-xl tracking-widest uppercase font-bold text-negro/90 hover:text-negro transition-colors duration-200"
          >
            Ver todas las entrevistas →
          </Link>
        </div>
      </div>

      <MarqueeTrack text={MARQUEE_TEXT} />
    </motion.section>
  );
}
