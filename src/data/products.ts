export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: string[];
  image?: string;
};

export const categories: ProductCategory[] = [
  {
    id: "meters",
    name: "Электросчётчики",
    slug: "electricity-meters",
    description: "Однофазные и трёхфазные приборы учёта электроэнергии с различными интерфейсами связи",
    icon: "⚡",
  },
  
  {
    id: "metrology",
    name: "Метрологическое оборудование",
    slug: "metrology-equipment",
    description: "Поверочные установки, эталоны и калибраторы для метрологического обеспечения",
    icon: "📐",
  },

  {
    id: "energy",
    name: "Энергетическое оборудование",
    slug: "energy-equipment",
    description: "Вакуумные выключатели, реклоузеры и интеллектуальные системы управления",
    icon: "🔌",
  },
 
];

export const products: Product[] = [
  // Meters
  { id: "m1", name: "CE207 R7", category: "meters", description: "Счётчик электроэнергии однофазный многотарифный со сменными модулями связи", specs: ["Класс точности 1.0", "Оптопорт", "RS-485", "LoRa", "PLC"] },
  { id: "m2", name: "CE308 S31", category: "meters", description: "Трёхфазный многофункциональный счётчик для коммерческого учёта", specs: ["Класс точности 0.5S", "RS-485", "Ethernet", "4 тарифа"] },
  { id: "m3", name: "CE102M S7", category: "meters", description: "Однофазный многотарифный счётчик для бытового применения", specs: ["Класс точности 1.0", "Оптопорт", "ЖКИ дисплей", "DIN-рейка"] },
  { id: "m4", name: "CE301 S31", category: "meters", description: "Трёхфазный счётчик активной энергии прямого включения", specs: ["Класс точности 1.0", "RS-485", "3 тарифа", "Импульсный выход"] },
  { id: "m5", name: "CE310 R33", category: "meters", description: "Трёхфазный интеллектуальный счётчик нового поколения", specs: ["Класс точности 0.5S", "GSM/NB-IoT", "Wi-Fi", "Реле отключения"] },
  { id: "m6", name: "CE208 S7", category: "meters", description: "Однофазный счётчик с расширенным функционалом", specs: ["Класс точности 1.0", "PLC", "GSM", "Оптопорт"] },
  // EHZ
  { id: "e1", name: "ЭНХЗ-1", category: "ehz", description: "Станция катодной защиты для магистральных трубопроводов", specs: ["Мощность до 5 кВт", "Автоматическое регулирование", "RS-485"] },
  { id: "e2", name: "ЭНХЗ-2М", category: "ehz", description: "Блок катодной защиты с микропроцессорным управлением", specs: ["Мощность до 3 кВт", "Телеметрия", "GSM-модуль"] },
  { id: "e3", name: "ИПЗ-01", category: "ehz", description: "Измеритель потенциала защиты для контроля ЭХЗ", specs: ["Автономное питание", "Память 10000 измерений", "USB"] },
  // Metrology
  { id: "mt1", name: "ЦЭ6804-М", category: "metrology", description: "Установка поверочная переносная для счётчиков электроэнергии", specs: ["Класс точности 0.05", "Диапазон тока 0.01-100А", "Автоматический режим"] },
  { id: "mt2", name: "КЭМ-01", category: "metrology", description: "Калибратор электроизмерительный многофункциональный", specs: ["Класс точности 0.02", "Сенсорный экран", "Ethernet"] },
  { id: "mt3", name: "УППУ-МЭ", category: "metrology", description: "Установка поверки счётчиков с автоматизированным процессом", specs: ["До 20 счётчиков одновременно", "Протоколирование", "Класс 0.05"] },
  // Energy
  { id: "en1", name: "ВВ/TEL-10", category: "energy", description: "Вакуумный выключатель для распределительных сетей 6-10 кВ", specs: ["Номинальный ток 630А", "Ток отключения 20кА", "Моторный привод"] },
  { id: "en2", name: "РВА/TEL-10", category: "energy", description: "Реклоузер вакуумный автоматический для воздушных ЛЭП", specs: ["Напряжение 10 кВ", "АПВ до 4 циклов", "GSM-телемеханика"] },
  { id: "en3", name: "КРМ-0.4", category: "energy", description: "Конденсаторная установка компенсации реактивной мощности", specs: ["Напряжение 0.4 кВ", "Автоматическое регулирование", "До 600 кВАр"] },
  // Telecom
  { id: "t1", name: "СТ-ОУ-РТ-С", category: "telecom", description: "Оптический кросс для телекоммуникационных сетей", specs: ["19\" стандарт", "До 96 волокон", "SC/APC разъёмы"] },
  { id: "t2", name: "ШМ-01", category: "telecom", description: "Шкаф монтажный телекоммуникационный напольный", specs: ["19\" стандарт", "42U", "Вентиляция", "Замок"] },
  { id: "t3", name: "СКС-48", category: "telecom", description: "Структурированная кабельная система для ЦОД", specs: ["Cat.6A", "48 портов", "Экранированная", "Патч-панель"] },
];
