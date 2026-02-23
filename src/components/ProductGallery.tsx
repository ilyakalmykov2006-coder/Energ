import { useState } from "react";

const SERVER_URL = "http://192.168.0.196:5000";

const ProductGallery = ({ images }) => {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded">
        Нет изображения
      </div>
    );
  }

  return (
    <div>
      {/* Главное изображение */}
      <div className="border rounded-xl overflow-hidden">
        <img
          src={`${SERVER_URL}/uploads/${images[active]?.path}`}
          alt=""
          className="w-full h-96 object-contain"
        />
      </div>

      {/* Миниатюры */}
      <div className="flex gap-3 mt-4 flex-wrap">
        {images.map((img, index) => (
          <img
            key={img.id}
            src={`${SERVER_URL}/uploads/${img.path}`}
            onClick={() => setActive(index)}
            className={`w-20 h-20 object-cover rounded cursor-pointer border transition ${
              active === index
                ? "border-blue-600 scale-105"
                : "border-gray-300 hover:scale-105"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;