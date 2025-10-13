import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { schemeApi, CreateSchemeRequest, projectApi, Project } from '@/api/apiService.ts'; // Updated path

interface SchemeFormData {
  project_id: string;
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

export function AddSchemeDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [schemeType, setSchemeType] = useState<'single_payment' | 'installment'>('single_payment');
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SchemeFormData>({
    defaultValues: {
      is_active: true,
    }
  });

  useEffect(() => {
    if (isOpen) {
      projectApi.getAllProjects()
        .then(res => setProjects(res.projects))
        .catch(err => toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' }));
    }
  }, [isOpen]);

  const onSubmit = async (formData: SchemeFormData) => {
    const data: CreateSchemeRequest = {
      ...formData,
      balance_payment_days: schemeType === 'single_payment' ? formData.balance_payment_days ?? null : null,
      total_installments: schemeType === 'installment' ? formData.total_installments ?? null : null,
      monthly_installment_amount: schemeType === 'installment' ? formData.monthly_installment_amount ?? null : null,
      is_active: formData.is_active,
    };

    try {
      await schemeApi.createScheme(data);
      toast({
        title: "Scheme Added",
        description: "New investment scheme has been successfully created.",
      });
      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create scheme.",
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Scheme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Investment Scheme</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 border-b pb-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheme_name">Scheme Name</Label>
                <Input
                  id="scheme_name"
                  {...register('scheme_name', { required: 'Scheme name is required' })}
                  placeholder="Enter scheme name"
                />
                {errors.scheme_name && <p className="text-sm text-destructive">{errors.scheme_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Project</Label>
                <Select onValueChange={(value) => setValue('project_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-b pb-4">
            <h3 className="text-lg font-semibold">Scheme Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scheme Type</Label>
                <Select onValueChange={(value) => {
                  setValue('scheme_type', value as 'single_payment' | 'installment');
                  setSchemeType(value as 'single_payment' | 'installment');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scheme type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_payment">Single Payment</SelectItem>
                    <SelectItem value="installment">Installment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_sqft">Area (Sqft)</Label>
                <Input
                  id="area_sqft"
                  type="number"
                  {...register('area_sqft', { required: 'Area is required', valueAsNumber: true })}
                  placeholder="Enter area in sqft"
                />
                {errors.area_sqft && <p className="text-sm text-destructive">{errors.area_sqft.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking_advance">Booking Advance (₹)</Label>
                <Input
                  id="booking_advance"
                  type="number"
                  {...register('booking_advance', { required: 'Booking advance is required', valueAsNumber: true })}
                  placeholder="Enter booking advance"
                />
                {errors.booking_advance && <p className="text-sm text-destructive">{errors.booking_advance.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rental_start_month">Rental Start Month</Label>
                <Input
                  id="rental_start_month"
                  type="number"
                  {...register('rental_start_month', { required: 'Rental start month is required', valueAsNumber: true })}
                  placeholder="Enter rental start month"
                />
                {errors.rental_start_month && <p className="text-sm text-destructive">{errors.rental_start_month.message}</p>}
              </div>
            </div>

            {schemeType === 'single_payment' && (
              <div className="space-y-2">
                <Label htmlFor="balance_payment_days">Balance Payment Days</Label>
                <Input
                  id="balance_payment_days"
                  type="number"
                  {...register('balance_payment_days', { required: schemeType === 'single_payment', valueAsNumber: true })}
                  placeholder="Enter balance payment days"
                />
                {errors.balance_payment_days && <p className="text-sm text-destructive">{errors.balance_payment_days.message}</p>}
              </div>
            )}

            {schemeType === 'installment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_installments">Total Installments</Label>
                  <Input
                    id="total_installments"
                    type="number"
                    {...register('total_installments', { required: schemeType === 'installment', valueAsNumber: true })}
                    placeholder="Enter total installments"
                  />
                  {errors.total_installments && <p className="text-sm text-destructive">{errors.total_installments.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_installment_amount">Monthly Installment Amount (₹)</Label>
                  <Input
                    id="monthly_installment_amount"
                    type="number"
                    {...register('monthly_installment_amount', { required: schemeType === 'installment', valueAsNumber: true })}
                    placeholder="Enter monthly installment amount"
                  />
                  {errors.monthly_installment_amount && <p className="text-sm text-destructive">{errors.monthly_installment_amount.message}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dates & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date', { required: 'Start date is required' })}
                />
                {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                {...register('is_active')}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Scheme</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}