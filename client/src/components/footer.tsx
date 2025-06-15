import { Facebook, Instagram, Linkedin, MessageCircle, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ivorian-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-ivorian-yellow mb-4">
              Barelle Distribution
            </h3>
            <p className="text-gray-300 mb-4">
              Votre partenaire de confiance pour les meilleurs produits ivoiriens. 
              Nous vous proposons une sélection exclusive de spiritueux, jus naturels et cigares authentiques.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-ivorian-yellow hover:text-ivorian-amber transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-ivorian-yellow hover:text-ivorian-amber transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
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
                  Abidjan, Côte d'Ivoire<br />
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
              Site réalisé avec ❤️ en Côte d'Ivoire
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
