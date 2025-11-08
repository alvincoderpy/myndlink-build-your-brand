import { motion } from "framer-motion";

interface Category {
  name: string;
  image: string;
  link: string;
}

interface CategoryGridProps {
  config: {
    enabled: boolean;
    title: string;
    items: Category[];
  };
}

export function CategoryGrid({ config }: CategoryGridProps) {
  if (!config.enabled || !config.items || config.items.length === 0) return null;
  
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-8 md:mb-12">
          {config.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {config.items.map((category, index) => (
            <motion.a
              key={category.name}
              href={category.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative aspect-square bg-secondary/50 overflow-hidden"
            >
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-xl md:text-2xl font-serif bg-background/90 px-6 py-2 backdrop-blur-sm">
                  {category.name}
                </h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
