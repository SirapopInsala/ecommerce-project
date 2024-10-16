"use client";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-black py-10 border-t-2">
      <div className="container mx-auto text-center">
        <p className="mb-2">&copy; {new Date().getFullYear()} Your E-commerce. All Rights Reserved.</p>
        <div className="flex justify-center space-x-4">
          <a href="/" className="hover:underline">Privacy Policy</a>
          <a href="/" className="hover:underline">Terms of Service</a>
          <a href="/" className="hover:underline">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
