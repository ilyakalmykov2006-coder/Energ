import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Building2, Award, Globe2, Users } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: Building2, title: "Производство", desc: "Собственные производственные мощности в Ставропольском крае" },
  { icon: Award, title: "Качество", desc: "Сертификация ISO 9001, продукция соответствует ГОСТ и ПП РФ №890" },
  { icon: Globe2, title: "География", desc: "Поставки в более чем 80 регионов России и страны СНГ" },
  { icon: Users, title: "Команда", desc: "Более 3000 квалифицированных специалистов" },
];

const About = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main>
        {/* Hero */}
        <section className="hero-gradient py-20">
          <div className="container mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-primary-foreground md:text-5xl"
            >
              О компании
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-2xl text-lg text-primary-foreground/80"
            >
              АО «Концерн Энергомера» — ведущий российский производитель приборов учёта электроэнергии,
              метрологического и энергетического оборудования.
            </motion.p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 card-shadow"
                >
                  <f.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="prose prose-sm max-w-none text-muted-foreground space-y-4"
              >
                <p>
                  Концерн «Энергомера» основан в 1994 году и является одним из крупнейших в России производителей
                  электротехнического оборудования. За более чем 30 лет работы компания произвела свыше 50 миллионов
                  счётчиков электроэнергии.
                </p>
                <p>
                  Продуктовая линейка включает электросчётчики, системы АСКУЭ, метрологическое оборудование,
                  энергетическое оборудование (вакуумные выключатели, реклоузеры), телекоммуникационное монтажное
                  оборудование и системы электрохимической защиты.
                </p>
                <p>
                  Компания обладает полным циклом разработки и производства, имеет собственные конструкторские бюро
                  и сертифицированные метрологические лаборатории.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;