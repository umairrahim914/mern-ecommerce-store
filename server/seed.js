const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const sampleProducts = [
  {
    name: "Men's Classic Cotton T-Shirt",
    slug: 'mens-classic-cotton-tshirt',
    description: 'Soft, breathable 100% cotton tee, perfect for everyday wear.',
    category: 'T-Shirts',
    brand: 'UrbanWear',
    basePrice: 19.99,
    images: ['https://via.placeholder.com/500x500?text=Cotton+Tee'],
    variants: [
      { sku: 'TS-BLK-S', size: 'S', color: 'Black', price: 19.99, stock: 25, images: [] },
      { sku: 'TS-BLK-M', size: 'M', color: 'Black', price: 19.99, stock: 30, images: [] },
      { sku: 'TS-BLK-L', size: 'L', color: 'Black', price: 21.99, stock: 20, images: [] },
      { sku: 'TS-WHT-S', size: 'S', color: 'White', price: 19.99, stock: 15, images: [] },
      { sku: 'TS-WHT-M', size: 'M', color: 'White', price: 19.99, stock: 18, images: [] },
    ],
  },
  {
    name: 'Slim Fit Denim Jeans',
    slug: 'slim-fit-denim-jeans',
    description: 'Durable stretch denim with a modern slim fit.',
    category: 'Jeans',
    brand: 'UrbanWear',
    basePrice: 49.99,
    images: ['https://via.placeholder.com/500x500?text=Denim+Jeans'],
    variants: [
      { sku: 'DJ-BLU-30', size: '30', color: 'Blue', price: 49.99, stock: 12, images: [] },
      { sku: 'DJ-BLU-32', size: '32', color: 'Blue', price: 49.99, stock: 20, images: [] },
      { sku: 'DJ-BLK-32', size: '32', color: 'Black', price: 52.99, stock: 10, images: [] },
    ],
  },
  {
    name: 'Running Sneakers',
    slug: 'running-sneakers',
    description: 'Lightweight cushioned sneakers built for daily runs.',
    category: 'Footwear',
    brand: 'SprintX',
    basePrice: 79.99,
    images: ['https://via.placeholder.com/500x500?text=Sneakers'],
    variants: [
      { sku: 'SN-GRY-8', size: '8', color: 'Grey', price: 79.99, stock: 8, images: [] },
      { sku: 'SN-GRY-9', size: '9', color: 'Grey', price: 79.99, stock: 14, images: [] },
      { sku: 'SN-RED-9', size: '9', color: 'Red', price: 84.99, stock: 6, images: [] },
    ],
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await Product.deleteMany({});
    console.log('Existing products cleared.');

    await Product.insertMany(sampleProducts);
    console.log(`${sampleProducts.length} sample products inserted successfully.`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedProducts();