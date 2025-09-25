import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AddSchemeDialog } from '@/components/Schemes/AddSchemeDialog';
import { mockSchemes } from '@/data/mockData';
import { IndianRupee, Calendar, MapPin } from 'lucide-react';

export default function Schemes() {
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-success text-success-foreground' 
      : 'bg-muted text-muted-foreground';
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investment Schemes</h1>
        <p className="text-muted-foreground mt-1">
          Manage payment plans and investment options
        </p>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">All Schemes</h2>
          <p className="text-sm text-muted-foreground">
            {mockSchemes.filter(s => s.is_active).length} active schemes
          </p>
        </div>
        <AddSchemeDialog />
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSchemes.map((scheme) => (
          <Card key={scheme.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{scheme.scheme_name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {scheme.project?.title || 'N/A'}
                  </div>
                </div>
                <Badge className={getStatusColor(scheme.is_active)}>
                  {scheme.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="capitalize">
                    {scheme.scheme_type.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Area:</span>
                  <span className="font-medium">{scheme.area_sqft.toLocaleString()} sqft</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Advance:</span>
                  <div className="flex items-center font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    {formatPrice(scheme.booking_advance)}
                  </div>
                </div>

                {scheme.scheme_type === 'installment' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Installments:</span>
                      <span className="font-medium">{scheme.total_installments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Monthly EMI:</span>
                      <div className="flex items-center font-medium">
                        <IndianRupee className="w-4 h-4" />
                        {formatPrice(scheme.monthly_installment_amount)}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(scheme.start_date)}
                  </div>
                  {scheme.end_date && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(scheme.end_date)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}