import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { mockProjects } from '@/data/mockData';

interface SchemeFormData {
  project_id: string;
  scheme_type: 'single_payment' | 'installment';
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days: number;
  total_installments: number;
  monthly_installment_amount: number;
  start_date: string;
  end_date: string;
}

export function AddSchemeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [schemeType, setSchemeType] = useState<'single_payment' | 'installment'>('single_payment');
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SchemeFormData>();

  const onSubmit = (data: SchemeFormData) => {
    console.log('Scheme data:', data);
    toast({
      title: "Scheme Added",
      description: "New investment scheme has been successfully created.",
    });
    reset();
    setIsOpen(false);
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  {mockProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheme Type</Label>
              <Select onValueChange={(value) => {
                setValue('scheme_type', value as any);
                setSchemeType(value as any);
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
                {...register('booking_advance', { valueAsNumber: true })}
                placeholder="Enter booking advance"
              />
            </div>

            {schemeType === 'single_payment' && (
              <div className="space-y-2">
                <Label htmlFor="balance_payment_days">Balance Payment Days</Label>
                <Input
                  id="balance_payment_days"
                  type="number"
                  {...register('balance_payment_days', { valueAsNumber: true })}
                  placeholder="Enter balance payment days"
                />
              </div>
            )}

            {schemeType === 'installment' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="total_installments">Total Installments</Label>
                  <Input
                    id="total_installments"
                    type="number"
                    {...register('total_installments', { valueAsNumber: true })}
                    placeholder="Enter total installments"
                  />
                </div>
              </>
            )}
          </div>

          {schemeType === 'installment' && (
            <div className="space-y-2">
              <Label htmlFor="monthly_installment_amount">Monthly Installment Amount (₹)</Label>
              <Input
                id="monthly_installment_amount"
                type="number"
                {...register('monthly_installment_amount', { valueAsNumber: true })}
                placeholder="Enter monthly installment amount"
              />
            </div>
          )}

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