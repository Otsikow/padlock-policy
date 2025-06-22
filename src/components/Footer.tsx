
const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-purple-900 text-white section-padding" role="contentinfo">
      <div className="container-responsive max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/9fb20310-6359-4b6d-8835-5bce032472bc.png" 
              alt="PadLock Insurance Logo" 
              className="h-8 w-auto" 
              loading="lazy"
              width="32"
              height="32"
            />
            <span className="text-lg font-semibold">Padlock Insurance</span>
          </div>
          <p className="text-gray-300 text-center md:text-right">
            © 2025 Padlock Insurance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
