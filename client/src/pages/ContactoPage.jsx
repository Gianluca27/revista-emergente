import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  project_name: z.string().optional(),
  instagram: z.string().optional(),
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function InputField({
  label,
  name,
  type = "text",
  required,
  placeholder,
  register,
  error,
}) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-1">
      <label className="font-ui text-base tracking-[0.2em] text-negro/90 uppercase">
        {label}
        {required && <span className="text-rojo ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`bg-gris border ${error ? "border-rojo" : "border-gris-mid"} text-negro font-mono text-lg px-4 py-3 placeholder:text-negro/50 focus:outline-none focus:border-rojo transition-colors duration-200`}
      />
      {error && (
        <p className="font-mono text-base text-rojo">{error.message}</p>
      )}
    </motion.div>
  );
}

function TextareaField({
  label,
  name,
  required,
  placeholder,
  register,
  error,
}) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-1">
      <label className="font-ui text-base tracking-[0.2em] text-negro/90 uppercase">
        {label}
        {required && <span className="text-rojo ml-1">*</span>}
      </label>
      <textarea
        rows={6}
        placeholder={placeholder}
        {...register(name)}
        className={`bg-gris border ${error ? "border-rojo" : "border-gris-mid"} text-negro font-mono text-lg px-4 py-3 placeholder:text-negro/50 focus:outline-none focus:border-rojo transition-colors duration-200 resize-none`}
      />
      {error && (
        <p className="font-mono text-base text-rojo">{error.message}</p>
      )}
    </motion.div>
  );
}

function SuccessState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-20 text-center"
    >
      <div className="inline-block mb-8">
        <span className="font-display text-9xl text-rojo leading-none">OK</span>
      </div>
      <h2 className="font-display text-4xl sm:text-5xl text-negro uppercase leading-tight mb-4">
        MENSAJE ENVIADO
      </h2>
      <p className="font-mono text-lg text-negro/90 max-w-md mx-auto">
        Te contactaremos a la brevedad. Gracias por escribirnos.
      </p>
    </motion.div>
  );
}

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setServerError(null);
    try {
      await api.post("/contact", data);
      setSubmitted(true);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Error al enviar el mensaje. Intentá de nuevo.";
      setServerError(msg);
    }
  }

  return (
    <div className="min-h-screen bg-crema">
      {/* Hero */}
      <section className="relative pt-24 pb-12 px-6 overflow-hidden">
        <div className="grain absolute inset-0 pointer-events-none opacity-30" />
        <div className="relative z-10 max-w-4xl">
          <motion.p
            className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            — Escribinos
          </motion.p>

          <motion.h1
            className="font-display text-7xl sm:text-9xl text-negro uppercase leading-none"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            CONTACTO
          </motion.h1>

          <motion.div
            className="mt-6 h-[3px] bg-rojo origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            style={{ width: "80px" }}
          />
        </div>
      </section>

      {/* Body */}
      <section className="py-12 px-6 border-t border-gris-mid">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left — copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.p
              className="font-ui text-base tracking-[0.25em] text-rojo uppercase mb-8"
              variants={fadeUp}
            >
              ¿Sos artista?
            </motion.p>

            <motion.h2
              className="font-display text-4xl sm:text-5xl text-negro uppercase leading-tight mb-6"
              variants={fadeUp}
            >
              QUEREMOS
              <br />
              ESCUCHARTE
            </motion.h2>

            <motion.div className="space-y-4" variants={stagger}>
              {[
                "Si hacés música independiente y querés aparecer en la revista, mandanos un mensaje.",
                "Cubrimos rock, electrónica, folk y todo lo que no entra en ninguna categoría.",
                "No importa el tamaño de tu proyecto. Importa la honestidad de lo que hacés.",
              ].map((text, i) => (
                <motion.p
                  key={i}
                  className="font-mono text-lg text-negro/90 leading-relaxed"
                  variants={fadeUp}
                >
                  {text}
                </motion.p>
              ))}
            </motion.div>

            <motion.div
              className="mt-10 pt-10 border-t border-gris-mid space-y-3"
              variants={fadeUp}
            >
              <p className="font-ui text-base tracking-[0.2em] text-rojo uppercase">
                También por redes
              </p>
              <p className="font-mono text-lg text-negro/90">
                @revistaemergente en Instagram
              </p>
            </motion.div>
          </motion.div>

          {/* Right — form */}
          <div>
            <AnimatePresence mode="wait">
              {submitted ? (
                <SuccessState key="success" />
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit(onSubmit)}
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                  noValidate
                >
                  <InputField
                    label="Nombre"
                    name="name"
                    required
                    placeholder="Tu nombre"
                    register={register}
                    error={errors.name}
                  />

                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    register={register}
                    error={errors.email}
                  />

                  <InputField
                    label="Proyecto / Banda"
                    name="project_name"
                    placeholder="Nombre del proyecto (opcional)"
                    register={register}
                    error={errors.project_name}
                  />

                  <InputField
                    label="Instagram"
                    name="instagram"
                    placeholder="@handle (opcional)"
                    register={register}
                    error={errors.instagram}
                  />

                  <TextareaField
                    label="Mensaje"
                    name="message"
                    required
                    placeholder="Contanos sobre tu proyecto, qué tipo de cobertura buscás..."
                    register={register}
                    error={errors.message}
                  />

                  {serverError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-mono text-base text-rojo border border-rojo px-4 py-3"
                    >
                      {serverError}
                    </motion.p>
                  )}

                  <motion.div variants={fadeUp}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-rojo text-crema font-display text-2xl uppercase tracking-widest py-4 hover:bg-negro hover:text-crema transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "ENVIANDO..." : "ENVIAR"}
                    </button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
