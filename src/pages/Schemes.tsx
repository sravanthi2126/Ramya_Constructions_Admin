import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AddSchemeDialog } from '@/components/Schemes/AddSchemeDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { schemeApi, Scheme, UpdateSchemeRequest, projectApi, Project } from '@/api/apiService.ts';
import { IndianRupee, Calendar, MapPin, Edit, Trash, TrendingUp, CreditCard, Building2 } from 'lucide-react';

interface EditSchemeFormData {
  scheme_type: 'single_payment' | 'installment';
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days?: number;
  total_installments?: number;
  monthly_installment_amount?: number;
  rental_start_month: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

function EditSchemeDialog({ scheme, onSuccess }: { scheme: Scheme; onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [schemeType, setSchemeType] = useState<'single_payment' | 'installment'>(scheme.scheme_type);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<EditSchemeFormData>({
    defaultValues: {
      scheme_type: scheme.scheme_type,
      scheme_name: scheme.scheme_name,
      area_sqft: scheme.area_sqft,
      booking_advance: scheme.booking_advance,
      balance_payment_days: scheme.balance_payment_days ?? undefined,
      total_installments: scheme.total_installments ?? undefined,
      monthly_installment_amount: scheme.monthly_installment_amount ?? undefined,
      rental_start_month: scheme.rental_start_month,
      start_date: scheme.start_date,
      end_date: scheme.end_date,
      is_active: scheme.is_active ?? true,
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        scheme_type: scheme.scheme_type,
        scheme_name: scheme.scheme_name,
        area_sqft: scheme.area_sqft,
        booking_advance: scheme.booking_advance,
        balance_payment_days: scheme.balance_payment_days ?? undefined,
        total_installments: scheme.total_installments ?? undefined,
        monthly_installment_amount: scheme.monthly_installment_amount ?? undefined,
        rental_start_month: scheme.rental_start_month,
        start_date: scheme.start_date,
        end_date: scheme.end_date,
        is_active: scheme.is_active ?? true,
      });
      setSchemeType(scheme.scheme_type);
    }
  }, [isOpen, scheme, reset]);

  const onSubmit = async (formData: EditSchemeFormData) => {
    const data: UpdateSchemeRequest = {
      ...formData,
      balance_payment_days: schemeType === 'single_payment' ? formData.balance_payment_days ?? null : null,
      total_installments: schemeType === 'installment' ? formData.total_installments ?? null : null,
      monthly_installment_amount: schemeType === 'installment' ? formData.monthly_installment_amount ?? null : null,
    };

    try {
      await schemeApi.updateScheme(scheme.id, data);
      toast({ title: "Scheme Updated", description: "Investment scheme has been successfully updated." });
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update scheme.", variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Investment Scheme
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
            </div>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <Label htmlFor="scheme_name" className="text-sm font-medium">Scheme Name</Label>
              <Input id="scheme_name" {...register('scheme_name')} placeholder="Enter scheme name" className="border-gray-300" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">Scheme Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Scheme Type</Label>
                <Select onValueChange={(value) => {
                  setValue('scheme_type', value as 'single_payment' | 'installment');
                  setSchemeType(value as 'single_payment' | 'installment');
                }} defaultValue={scheme.scheme_type}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_payment">💰 Single Payment</SelectItem>
                    <SelectItem value="installment">📅 Installment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_sqft" className="text-sm font-medium">Area (Sqft)</Label>
                <Input id="area_sqft" type="number" {...register('area_sqft', { valueAsNumber: true })} placeholder="Enter area" className="border-gray-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-2 md:pr-4 md:border-r md:border-gray-300">
                <Label htmlFor="booking_advance" className="text-sm font-medium">
                  Booking Advance (₹)
                </Label>
                <Input
                  id="booking_advance"
                  type="number"
                  {...register('booking_advance', { valueAsNumber: true })}
                  placeholder="Enter amount"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2 md:pl-4">
                <Label htmlFor="rental_start_month" className="text-sm font-medium">
                  Rental Start Month
                </Label>
                <Input
                  id="rental_start_month"
                  type="number"
                  {...register('rental_start_month', { valueAsNumber: true })}
                  placeholder="Enter month"
                  className="border-gray-300"
                />
              </div>
            </div>


            {schemeType === 'single_payment' && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Label htmlFor="balance_payment_days" className="text-sm font-medium">Balance Payment Days</Label>
                <Input id="balance_payment_days" type="number" {...register('balance_payment_days', { valueAsNumber: true })} placeholder="Enter days" />
              </div>
            )}

            {schemeType === 'installment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="space-y-2">
                  <Label htmlFor="total_installments" className="text-sm font-medium">Total Installments</Label>
                  <Input id="total_installments" type="number" {...register('total_installments', { valueAsNumber: true })} placeholder="Enter count" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_installment_amount" className="text-sm font-medium">Monthly Amount (₹)</Label>
                  <Input id="monthly_installment_amount" type="number" {...register('monthly_installment_amount', { valueAsNumber: true })} placeholder="Enter amount" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">Dates & Status</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium">Start Date</Label>
                <Input id="start_date" type="date" {...register('start_date')} className="border-gray-300" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm font-medium">End Date</Label>
                <Input id="end_date" type="date" {...register('end_date')} className="border-gray-300" />
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg border border-green-200">
              <Switch id="is_active" {...register('is_active')} />
              <Label htmlFor="is_active" className="font-medium cursor-pointer">Active Status</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="px-6">
              Cancel
            </Button>
            <Button type="submit" className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Update Scheme
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Schemes() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schemeRes, projectRes] = await Promise.all([
        schemeApi.getAllSchemes(),
        projectApi.getAllProjects()
      ]);
      setSchemes(schemeRes.schemes);
      const map: Record<string, string> = {};
      projectRes.projects.forEach(p => map[p.id] = p.title);
      setProjectMap(map);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load data.", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (schemeId: string) => {
    if (!confirm('Are you sure you want to delete this scheme?')) return;
    try {
      await schemeApi.deleteScheme(schemeId);
      toast({ title: "Scheme Deleted", description: "Investment scheme has been deleted." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete scheme.", variant: 'destructive' });
    }
  };

  const getStatusColor = (isActive?: boolean) => {
    return (isActive ?? true)
      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm';
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price == null) return 'N/A';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-sm font-medium">Loading schemes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Investment Schemes
              </h1>
            </div>
            <p className="text-gray-600 text-sm ml-14">
              Manage payment plans and investment options for your projects
            </p>
          </div>
        </div>
      </div>

      {/* Stats & Actions Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Schemes</p>
                <p className="text-lg font-bold text-gray-900">{schemes.length}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <CreditCard className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Schemes</p>
                <p className="text-lg font-bold text-green-600">
                  {schemes.filter(s => s.is_active ?? true).length}
                </p>
              </div>
            </div>
          </div>
          <AddSchemeDialog onSuccess={fetchData} />
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schemes.map((scheme) => (
          <Card
            key={scheme.id}
            className="group relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 rounded-xl"
          >
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {scheme.scheme_name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md w-fit">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {projectMap[scheme.project_id] || scheme.project_id}
                  </div>
                </div>
                <Badge className={`${getStatusColor(scheme.is_active)} px-2 py-0.5 rounded-md font-medium text-xs`}>
                  {scheme.is_active ?? true ? '✓ Active' : '✕ Inactive'}
                </Badge>
              </div>

              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="capitalize px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700"
                >
                  {scheme.scheme_type === 'single_payment' ? '💰 Single Payment' : '📅 Installment Plan'}
                </Badge>
              </div>

              {/* Details Grid */}
              <div className="space-y-2 bg-gradient-to-br from-gray-50 to-blue-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">Area</span>
                  <span className="font-bold text-gray-900 flex items-center text-sm">
                    <Building2 className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    {scheme.area_sqft.toLocaleString()} sqft
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">Booking Advance</span>
                  <span className="font-bold text-green-600 text-sm">
                    {formatPrice(scheme.booking_advance)}
                  </span>
                </div>

                {scheme.scheme_type === 'installment' && (
                  <>
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                      <span className="text-xs text-gray-600 font-medium">Installments</span>
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs">
                        {scheme.total_installments ?? 'N/A'} months
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-gray-600 font-medium">Monthly EMI</span>
                      <span className="font-bold text-blue-600 text-sm">
                        {formatPrice(scheme.monthly_installment_amount)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between py-1.5 pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">Rental Starts</span>
                  <Badge className="bg-teal-100 text-teal-700 text-xs">
                    Month {scheme.rental_start_month}
                  </Badge>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-blue-500" />
                  {formatDate(scheme.start_date)}
                </div>
                {scheme.end_date && (
                  <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-purple-500" />
                    {formatDate(scheme.end_date)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center gap-1 pt-2 border-t border-gray-200">
                <EditSchemeDialog scheme={scheme} onSuccess={fetchData} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                  onClick={() => handleDelete(scheme.id)}
                >
                  <Trash className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {schemes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No schemes found</h3>
          <p className="text-gray-500 text-sm mb-4">Get started by creating your first investment scheme</p>
          <AddSchemeDialog onSuccess={fetchData} />
        </div>
      )}
    </div>
  );
}