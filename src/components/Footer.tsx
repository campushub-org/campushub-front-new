import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 pt-24 pb-12 border-t border-border/50 mt-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                CampusHub
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              La plateforme de référence pour la gestion académique moderne. Simplifiez, automatisez et transformez votre établissement.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-8 uppercase tracking-widest text-sm">Produit</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Fonctionnalités</a></li>
              <li><a href="#problems" className="text-muted-foreground hover:text-primary transition-colors">Comparaison</a></li>
              <li><a href="#roles" className="text-muted-foreground hover:text-primary transition-colors">Rôles</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Tarifs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-8 uppercase tracking-widest text-sm">Ressources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Guide d'utilisation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support technique</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog académique</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-8 uppercase tracking-widest text-sm">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>contact@campushub.edu</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span>+33 (0) 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>75000 Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">
            © 2026 CampusHub. Tous droits réservés. Conçu pour l'excellence.
          </p>
          <div className="flex gap-8 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Confidentialité</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Mentions légales</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
