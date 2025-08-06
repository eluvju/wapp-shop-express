import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, Star, Truck, Shield, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Truck,
      title: "Entrega Rápida",
      description: "Entregamos em todo o Brasil com agilidade e segurança"
    },
    {
      icon: Shield,
      title: "Compra Segura",
      description: "Seus dados protegidos e pagamento garantido"
    },
    {
      icon: HeartHandshake,
      title: "Atendimento VIP",
      description: "Suporte especializado via WhatsApp"
    }
  ];

  const categories = [
    { name: "Eletrônicos", image: "/placeholder.svg", count: 25 },
    { name: "Casa & Jardim", image: "/placeholder.svg", count: 18 },
    { name: "Moda", image: "/placeholder.svg", count: 32 },
    { name: "Esportes", image: "/placeholder.svg", count: 15 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchTerm=""
        onSearchChange={() => {}}
        selectedCategory="all"
        onCategoryChange={() => {}}
        categories={[]}
      />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-primary">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10 bg-cover bg-center" />
          <div className="relative container mx-auto px-4 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white"
              >
                <Badge variant="secondary" className="mb-4">
                  Novidades toda semana
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  Encontre os Melhores
                  <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    Produtos Aqui
                  </span>
                </h1>
                <p className="text-xl mb-8 text-white/90 max-w-md">
                  Catálogo completo com produtos selecionados, preços especiais e entrega garantida.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 shadow-large"
                    onClick={() => navigate('/catalog')}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Ver Catálogo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Ofertas do Dia
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative">
                  <img
                    src="/placeholder.svg"
                    alt="Produtos em destaque"
                    className="w-full max-w-lg mx-auto rounded-2xl shadow-large"
                  />
                  <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-large">
                    <Star className="w-8 h-8 text-warning fill-current" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center p-6 border-0 shadow-medium hover:shadow-large transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Explore Nossas Categorias
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Produtos organizados por categoria para facilitar sua busca
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="group cursor-pointer overflow-hidden border-0 shadow-medium hover:shadow-large transition-all duration-300 hover:-translate-y-2">
                    <div className="relative">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                        {category.count} produtos
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                        onClick={() => navigate('/catalog')}
                      >
                        Ver produtos
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-primary">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-white"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Pronto para Começar a Comprar?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Acesse nosso catálogo completo e encontre exatamente o que você precisa
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-large"
                onClick={() => navigate('/catalog')}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Explorar Catálogo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;