import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getTeamMembers } from "../services/publications";

const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3001";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const features = [
  {
    number: "01",
    title: "ENTREVISTAS",
    description:
      "En Revista Emergente hacemos entrevistas cercanas y auténticas donde buscamos conocer el lado más humano y creativo de cada artista. Hablamos sobre arte, música, procesos creativos y experiencias personales para generar conversaciones reales con artistas emergentes y referentes de la escena cultural argentina.",
  },
  {
    number: "02",
    title: "COBERTURAS",
    description:
      "En Revista Emergente realizamos coberturas de eventos culturales, recitales y experiencias artísticas capturando tanto lo que pasa en el escenario como la energía del público y todo lo que sucede detrás de cada evento. Buscamos transmitir la esencia de cada experiencia a través de fotos, videos, entrevistas y contenido dinámico para redes.",
  },
  {
    number: "03",
    title: "ARCHIVO",
    description:
      "Un archivo vivo de la música independiente argentina, antes de que el mercado la descubra",
  },
];

const manifesto = [
  "Emergente nació del hartazgo de ver a la música independiente argentina ignorada por los medios tradicionales.",
  "No somos un medio de difusión. Somos un archivo vivo. Documentamos lo que sucede antes de que el mercado lo descubra, lo empaquete y lo venda de vuelta.",
  "Entrevistamos artistas que llenan salones de 200 personas con la misma seriedad con que otros entrevistan estadios. Porque lo que importa no es el tamaño del escenario sino la verdad de lo que pasa arriba.",
  "Si el sonido te importa, estás en el lugar correcto.",
];

export default function SobreNosotrosPage() {
  const [team, setTeam] = useState(null); // null = cargando; [] = vacío

  useEffect(() => {
    getTeamMembers()
      .then((data) => setTeam(Array.isArray(data) ? data : []))
      .catch(() => setTeam([]));
  }, []);

  // Columnas del equipo según cantidad de miembros (literales completos para que Tailwind las detecte)
  const teamCount = team?.length ?? 0;
  const teamColsClass =
    teamCount >= 3 ? "md:grid-cols-3" : teamCount === 2 ? "md:grid-cols-2" : "md:grid-cols-1";
  const teamWidthClass =
    teamCount >= 3 ? "" : teamCount === 2 ? "md:max-w-3xl md:mx-auto" : "md:max-w-md md:mx-auto";

  return (
    <div className="min-h-screen bg-crema">
      {/* Hero */}
      <section className="relative pt-24 pb-12 px-6 overflow-hidden bg-crema">
        <div className="grain absolute inset-0 pointer-events-none opacity-30" />
        <div className="relative z-10 max-w-4xl">
          <motion.p
            className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            — Quiénes somos
          </motion.p>

          <motion.h1
            className="font-display text-7xl sm:text-9xl text-negro uppercase leading-none"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            SOBRE
            <br />
            NOSOTROS
          </motion.h1>

          <motion.div
            className="mt-6 h-[3px] bg-rojo origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, margin: "-60px" }}
            style={{ width: "80px" }}
          />
        </div>
      </section>

      {/* Manifiesto */}
      <section className="bg-crema py-16 px-6 border-t border-gris-mid">
        <div className="max-w-2xl">
          <motion.p
            className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            Manifiesto
          </motion.p>

          <motion.div
            className="space-y-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {manifesto.map((paragraph, i) => (
              <motion.p
                key={i}
                className="font-mono text-lg text-negro/90 leading-relaxed"
                variants={fadeUp}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ¿Qué es Emergente? */}
      <section className="py-16 px-6 bg-papel border-t border-negro/10">
        <div className="max-w-5xl mx-auto">
          <motion.p
            className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            ¿Qué es Emergente?
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gris-mid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.number}
                className="bg-crema border border-gris-mid p-6 hover:border-rojo transition-colors duration-200 group"
                variants={fadeUp}
              >
                <span
                  className="text-5xl text-rojo leading-none block mb-4 group-hover:opacity-80 transition-opacity"
                  style={{ fontFamily: '"Arial Black", "Helvetica Black", Impact, sans-serif', fontWeight: 900 }}
                >
                  {feature.number}
                </span>
                <h3 className="font-display text-2xl text-negro uppercase mb-3">
                  {feature.title}
                </h3>
                <p className="font-mono text-base text-negro/90 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Equipo */}
      {team && team.length > 0 && (
        <section className="bg-crema py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.p
              className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-10"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              El Equipo
            </motion.p>

            <motion.div
              className={`grid grid-cols-1 ${teamColsClass} ${teamWidthClass} gap-px bg-gris-mid`}
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {team.map((member) => (
                <motion.div
                  key={member.id}
                  className="bg-crema"
                  variants={fadeUp}
                >
                  {member.photo ? (
                    <img
                      src={member.photo.startsWith("http") ? member.photo : UPLOAD_URL + member.photo}
                      alt={member.name}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-gris" />
                  )}
                  <div className="p-4">
                    <h3 className="font-display text-xl text-negro uppercase leading-tight mb-1">
                      {member.name}
                    </h3>
                    {member.role && (
                      <p className="font-ui text-base text-rojo uppercase tracking-widest mb-3">
                        {member.role}
                      </p>
                    )}
                    {member.bio && (
                      <p className="font-mono text-base text-negro/90 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-6 text-center bg-rojo">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.h2
            className="font-display text-5xl sm:text-6xl text-negro uppercase leading-none mb-4"
            variants={fadeUp}
          >
            <span className="font-arialblack">¿</span>TENÉS UN PROYECTO<span className="font-arialblack">?</span>
          </motion.h2>

          <motion.p
            className="font-mono text-lg text-negro/90 mb-8"
            variants={fadeUp}
          >
            Si querés aparecer en la revista, mandanos un mensaje.
          </motion.p>

          <motion.div variants={fadeUp}>
            <Link
              to="/contacto"
              className="inline-block border-2 border-negro text-negro hover:bg-negro hover:text-crema font-ui uppercase tracking-widest px-8 py-3 transition-colors duration-200"
            >
              Escribinos
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
