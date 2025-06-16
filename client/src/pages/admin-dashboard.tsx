
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Package, ShoppingCart, TrendingUp, Activity, BarChart3, Calendar } from "lucide-react";

interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-yellow-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-yellow-100 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map(() => (
              <Card key={`loading-stat-card-${crypto.randomUUID()}`} className="animate-pulse border-yellow-200">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-yellow-100 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-yellow-100 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-yellow-100 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Commandes Totales",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-yellow-700",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-300",
      iconBg: "bg-yellow-500",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Commandes en Attente",
      value: stats?.pendingOrders || 0,
      icon: Package,
      color: "text-orange-700",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      borderColor: "border-orange-300",
      iconBg: "bg-orange-500",
      change: "+5%",
      changeType: "neutral"
    },
    {
      title: "Commandes Aujourd'hui",
      value: stats?.todayOrders || 0,
      icon: TrendingUp,
      color: "text-amber-700",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
      borderColor: "border-amber-300",
      iconBg: "bg-amber-500",
      change: "+24%",
      changeType: "positive"
    },
    {
      title: "Chiffre d'Affaires",
      value: `${(stats?.totalRevenue || 0).toLocaleString()} CFA`,
      icon: BarChart3,
      color: "text-gray-700",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-300",
      iconBg: "bg-gray-600",
      change: "+18%",
      changeType: "positive"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Header avec motif ivoirien */}
      <div className="relative bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Tableau de Bord Administrateur</h1>
              <p className="text-yellow-100 text-lg">Barelle Distribution - Interface de gestion professionnelle</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className={`hover:shadow-xl transition-all duration-300 border-2 ${stat.borderColor} ${stat.bgColor} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${stat.color}`}>
                    {stat.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${stat.changeType === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">
                      {index === 0 && "vs mois dernier"}
                      {index === 1 && "à traiter"}
                      {index === 2 && "vs hier"}
                      {index === 3 && "total"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-gray-900">Gestion des Utilisateurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gérez les comptes utilisateurs B2B, les rôles et les permissions d&apos;accès à votre plateforme.
              </p>
              <a
                href="/admin/users"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Gérer les Utilisateurs
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-gray-900">Gestion des Produits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Ajoutez, modifiez et organisez votre catalogue de produits ivoiriens authentiques.
              </p>
              <a
                href="/admin/products"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Gérer les Produits
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <span className="text-gray-900">Gestion des Commandes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Suivez et gérez toutes les commandes de vos clients professionnels.
              </p>
              <a
                href="/admin/orders"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Gérer les Commandes
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
