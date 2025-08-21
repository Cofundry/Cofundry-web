// app/api/products/route.ts
import { NextResponse } from 'next/server';

const dummyProducts = [
  {
    id: '1',
    title: 'Barber Clippers X1000',
    price: 199,
    description: 'High-quality clippers for professional use',
    category: 'barber',
    rating: 4.8,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    title: 'Salon Chair Deluxe',
    price: 499,
    description: 'Ergonomic salon chair with premium comfort',
    category: 'salon',
    rating: 4.5,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    title: 'Shaving Cream Pro',
    price: 29,
    description: 'Smooth and refreshing shaving cream for sensitive skin',
    category: 'barber',
    rating: 4.2,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '4',
    title: 'Hair Dryer Turbo 3000',
    price: 249,
    description: 'Powerful hair dryer for quick and safe drying',
    category: 'salon',
    rating: 4.7,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '5',
    title: 'Scissors Set Premium',
    price: 119,
    description: 'Professional stainless steel scissors set',
    category: 'barber',
    rating: 4.6,
    image: 'https://via.placeholder.com/150',
  },
];

export async function GET() {
  return NextResponse.json(dummyProducts);
}
