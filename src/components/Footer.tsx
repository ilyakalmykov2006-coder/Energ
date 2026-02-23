import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">Э</span>
              </div>
              <span className="text-lg font-bold">ЭНЕРГОМЕРА</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ведущий российский производитель приборов учёта электроэнергии и электрооборудования.
            </p>
          </div>

          {/* Каталог */}
          <div>
            <h4 className="mb-4 font-semibold">Каталог</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/catalog/meters" className="transition-colors hover:text-primary">Электросчётчики</Link></li>
              <li><Link to="/catalog/ehz" className="transition-colors hover:text-primary">Электрохимзащита</Link></li>
              <li><Link to="/catalog/metrology" className="transition-colors hover:text-primary">Метрология</Link></li>
              <li><Link to="/catalog/energy" className="transition-colors hover:text-primary">Энергооборудование</Link></li>
              <li><Link to="/catalog/telecom" className="transition-colors hover:text-primary">Телеком оборудование</Link></li>
              <Link to="/where-buy">Где купить</Link>

            </ul>
          </div>

          {/* Компания */}
          <div>
            <h4 className="mb-4 font-semibold">Компания</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="transition-colors hover:text-primary">О компании</Link></li>
              <li><Link to="/contacts" className="transition-colors hover:text-primary">Контакты</Link></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="mb-4 font-semibold">Контакты</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:88002007527" className="hover:text-primary">8-800-200-75-27</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:info@energomera.ru" className="hover:text-primary">info@energomera.ru</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                <span>г. Ставрополь, ул. Ленина, 415</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} АО «Концерн Энергомера». Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
