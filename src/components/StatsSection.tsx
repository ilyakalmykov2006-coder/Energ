import { motion } from "framer-motion";

const stats = [
  { value: "30+", label: "Лет на рынке" },
  { value: "300+", label: "Моделей продукции" },
  { value: "50M+", label: "Счётчиков произведено" },
  { value: "80+", label: "Регионов поставки" },
];

const StatsSection = () => {
  return (
    <section className="bg-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-primary-foreground md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-primary-foreground/70">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
