import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const locations = [
  {
    name: "Удовицкий Андрей Дмитриевич - Региональный представитель",
    city: "Ставрополь",
    phone: "+7-906-469-75-69",
    email: "UdovickijAD@energomera.ru",
  },
  {
    name: "Расколупа Владимир Александрович - Управляющий по сбыту",
    city: "Ставрополь",
    phone: "+7 (919) 738-61-71",
    email: "RaskolupaVA@energomera.ru",
  },
  {
    name: "«ИНВЭНТ-СК», ООО",
    city: "Ставрополь, ул. Пирогова, д. 42/1",
    phone: "(8652) 47-87-38",
    email: "invent-sk@mail.ru",
    coords: [45.00847226540163, 41.912584139571074],
  },
  {
    name: "«КПК «Ставропольстройопторг», АО",
    city: "356236, Ставропольский край, Шпаковский район, с. Верхнерусское, заезд Тупиковый, 4",
    phone: "(86553) 2-03-75",
    email: "electr@optorg.ru",
    website: "www.optorg.ru",
    coords: [45.111455599293414, 41.9628412395752],
  },
  {
    name: "«ЭТМ» ООО - Ставрополь",
    city: "Ставрополь, ул. Доваторцев, д. 60",
    phone: "8 800 775 17 71",
    email: "stavropol1@etm.ru",
    website: "www.etm.ru",
    coords: [45.00213109364821, 41.926596372477],
  },
];

const WhereBuy = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!window.ymaps) return;

    window.ymaps.ready(() => {
      const map = new window.ymaps.Map(mapRef.current!, {
        center: [45.0448, 41.9693],
        zoom: 10,
        controls: ["zoomControl", "fullscreenControl"],
      });

      locations.forEach((loc) => {
        const placemark = new window.ymaps.Placemark(
          loc.coords,
          {
            balloonContentHeader: loc.name,
            balloonContentBody: `
              ${loc.city}<br/>
              ${loc.phone ? `Тел.: ${loc.phone}<br/>` : ""}
              ${loc.email ? `E-mail: ${loc.email}<br/>` : ""}
              ${loc.website ? `Сайт: <a href="http://${loc.website}" target="_blank">${loc.website}</a>` : ""}
            `,
          },
          { preset: "islands#blueDotIcon" }
        );
        map.geoObjects.add(placemark);
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> 
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6">Где купить — Ставропольский край</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Левая колонка — список организаций */}
          <div className="md:w-1/2 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
            {locations.map((loc, i) => (
              <div
                key={i}
                className="border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <h2 className="font-semibold text-lg">{loc.name}</h2>
                <p className="text-sm text-muted-foreground">{loc.city}</p>
                {loc.phone && <p className="text-sm">Тел.: {loc.phone}</p>}
                {loc.email && <p className="text-sm">E-mail: {loc.email}</p>}
                {loc.website && (
                  <p className="text-sm">
                    Сайт:{" "}
                    <a
                      href={`http://${loc.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {loc.website}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Правая колонка — карта */}
          <div className="md:w-1/2 h-[70vh] border">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhereBuy;


    
