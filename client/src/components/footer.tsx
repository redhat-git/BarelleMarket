import { Linkedin, MessageCircle, MapPin, Phone, Mail, Clock } from "lucide-react";

// Facebook SVG from simpleicons.org
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 10.995 10.125 11.854v-8.385H7.078v-3.47h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.953.926-1.953 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.068 24 18.092 24 12.073z" />
  </svg>
);

// Instagram SVG from simpleicons.org
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.974.975 1.244 2.242 1.306 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.332 2.633-1.306 3.608-.975.974-2.242 1.244-3.608 1.306-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.332-3.608-1.306-.974-.975-1.244-2.242-1.306-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.332-2.633 1.306-3.608C4.513 2.565 5.78 2.295 7.146 2.233 8.412 2.175 8.792 2.163 12 2.163zm0-2.163C8.736 0 8.332.012 7.052.07 5.77.128 4.672.388 3.678 1.382 2.684 2.376 2.424 3.474 2.366 4.756 2.308 6.036 2.296 6.44 2.296 12c0 5.56.012 5.964.07 7.244.058 1.282.318 2.38 1.312 3.374.994.994 2.092 1.254 3.374 1.312 1.28.058 1.684.07 7.244.07s5.964-.012 7.244-.07c1.282-.058 2.38-.318 3.374-1.312.994-.994 1.254-2.092 1.312-3.374.058-1.28.07-1.684.07-7.244s-.012-5.964-.07-7.244c-.058-1.282-.318-2.38-1.312-3.374C21.38.388 20.282.128 19 .07 17.72.012 17.316 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-ivorian-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-ivorian-yellow mb-4">
              Suivez-nous
            </h3>
            <a
              href="#"
              className="text-ivorian-yellow hover:text-ivorian-amber transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            {/* Social Links */}
            <a
              href="#"
              className="text-ivorian-yellow hover:text-ivorian-amber transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-ivorian-yellow hover:text-ivorian-amber transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-ivorian-yellow hover:text-ivorian-amber transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-ivorian-yellow mb-4">Liens Utiles</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-ivorian-yellow transition-colors">Accueil</a></li>
              <li><a href="/products" className="hover:text-ivorian-yellow transition-colors">Catalogue Produits</a></li>
              <li><a href="/api/login" className="hover:text-ivorian-yellow transition-colors">Espace B2B</a></li>
              <li><a href="#" className="hover:text-ivorian-yellow transition-colors">À Propos</a></li>
              <li><a href="#" className="hover:text-ivorian-yellow transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-ivorian-yellow transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="text-lg font-bold text-ivorian-yellow mb-4">Nos Produits</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/products?category=spiritueux" className="hover:text-ivorian-yellow transition-colors">Spiritueux Premium</a></li>
              <li><a href="/products?category=jus-naturels" className="hover:text-ivorian-yellow transition-colors">Jus Naturels</a></li>
              <li><a href="/products?category=cigares" className="hover:text-ivorian-yellow transition-colors">Cigares Artisanaux</a></li>
              <li><a href="/products?category=accessoires" className="hover:text-ivorian-yellow transition-colors">Accessoires</a></li>
              <li><a href="/products?featured=true" className="hover:text-ivorian-yellow transition-colors">Coffrets Cadeaux</a></li>
              <li><a href="/products" className="hover:text-ivorian-yellow transition-colors">Nouveautés</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-ivorian-yellow mb-4">Contact</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-ivorian-yellow mr-2 mt-1 flex-shrink-0" />
                <span>
                  Abidjan, Côte d&#39;Ivoire<br />
                  Zone Industrielle de Yopougon
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-ivorian-yellow mr-2 flex-shrink-0" />
                <span>+225 XX XX XX XX</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-ivorian-yellow mr-2 flex-shrink-0" />
                <span>contact@barelle-distribution.ci</span>
              </div>
              <div className="flex items-start">
                <Clock className="h-4 w-4 text-ivorian-yellow mr-2 mt-1 flex-shrink-0" />
                <span>
                  Lun-Ven: 8h-18h<br />
                  Sam: 8h-14h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            <div className="text-gray-400 text-sm">
              © 2024 Barelle Distribution. Tous droits réservés.
            </div>
            <div className="flex space-x-4 text-sm text-gray-400">
              <a href="#" className="hover:text-ivorian-yellow transition-colors">Mentions Légales</a>
              <a href="#" className="hover:text-ivorian-yellow transition-colors">Politique de Confidentialité</a>
              <a href="#" className="hover:text-ivorian-yellow transition-colors">CGV</a>
            </div>
            <div className="text-sm text-gray-400 lg:text-right">
              Site réalisé avec ❤️ en Côte d&#39;Ivoire
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
