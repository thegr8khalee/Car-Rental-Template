import branding from '../config/branding';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-10 px-6 font-inter flex flex-col justify-center items-center w-full mt-auto">
      {/* Top section */}
      <div className="mb-10 md:flex w-full max-w-6xl items-center justify-between">
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <h3 className="text-xl md:text-2xl font-semibold">Join</h3>
          <h3 className="text-2xl md:text-4xl font-semibold mb-2 font-['Microgramma_D_Extended'] text-primary">
            {branding.company.name}
          </h3>
          <p className="mb-3 text-gray-300 text-xs md:text-sm">
            Receive Price Updates, Blog Notifications & More.
          </p>
        </div>

        <form className="w-full md:w-[50vw] inline-flex gap-2 flex-wrap justify-center">
          <div className="items-center justify-between p-1 flex w-full rounded-full bg-white/30 h-15 relative">
            <div className="h-full items-center flex w-full">
              <input
                type="text"
                placeholder="Enter your email"
                className="input w-full border-none bg-transparent text-white placeholder:text-white shadow-none px-4 focus:outline-none"
              />
            </div>
            <div className="h-full flex justify-end">
              <button className="btn px-6 btn-primary rounded-full h-full font-normal">
                Join
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Links section */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center border-t border-white/20 pt-6">
        <div className="flex flex-col gap-2 mb-4 md:mb-0 text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-300">
            <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            {branding.features.blog && (
              <a href="/blogs" className="hover:text-primary transition-colors">
                Blogs
              </a>
            )}
            {branding.features.rentals && (
              <a href="/listings" className="hover:text-primary transition-colors">
                Listings
              </a>
            )}
            <a href="/contact" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            <p>{branding.contact.address.formatted}</p>
            <p className="mt-1">
              {branding.contact.phones.main.display} • {branding.contact.emails.info}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} {branding.company.legalName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
