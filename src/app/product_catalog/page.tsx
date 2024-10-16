import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/Navbar/Navbar';
import ProductCatalog from '@/components/ProductCatalogPage/ProductCatalog';

const ProductCatalogPage = () => {
  return (
    <div>
      <Navbar />
      <ProductCatalog />
      <Footer />
    </div>
  );
};

export default ProductCatalogPage;