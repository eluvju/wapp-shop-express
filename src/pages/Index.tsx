import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, Star, Truck, Shield, HeartHandshake } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
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

  // Página preservada apenas para compatibilidade; redireciona para "/"
  return (
    <Navigate to="/" replace />
  );
};

export default Index;
