import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/Navbar/Navbar';
import ProductDetails from '@/components/ProductDetailsPage/ProductDetails';

const ProductPage = () => {
  return (
    <div>
        <Navbar/>
        <div className="h-screen w-screen bg-gray-100">
          <ProductDetails />
        </div>
        <Footer/>
    </div>
  );
};

export default ProductPage;
