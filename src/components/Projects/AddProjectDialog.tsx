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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ProjectFormData {
  title: string;
  location: string;
  description: string;
  status: 'available' | 'sold_out' | 'coming_soon';
  base_price: number;
  property_type: 'commercial' | 'residential' | 'plot' | 'land' | 'mixed_use';
  total_units: number;
  available_units: number;
  rera_number: string;
}

export function AddProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectFormData>();

  const onSubmit = (data: ProjectFormData) => {
    console.log('Project data:', data);
    toast({
      title: "Project Added",
      description: "New project has been successfully created.",
    });
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter project title"
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location', { required: 'Location is required' })}
                placeholder="Enter project location"
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold_out">Sold Out</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select onValueChange={(value) => setValue('property_type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="mixed_use">Mixed Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price (₹)</Label>
              <Input
                id="base_price"
                type="number"
                {...register('base_price', { required: 'Base price is required', valueAsNumber: true })}
                placeholder="Enter base price"
              />
              {errors.base_price && <p className="text-sm text-destructive">{errors.base_price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_units">Total Units</Label>
              <Input
                id="total_units"
                type="number"
                {...register('total_units', { required: 'Total units is required', valueAsNumber: true })}
                placeholder="Enter total units"
              />
              {errors.total_units && <p className="text-sm text-destructive">{errors.total_units.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_units">Available Units</Label>
              <Input
                id="available_units"
                type="number"
                {...register('available_units', { required: 'Available units is required', valueAsNumber: true })}
                placeholder="Enter available units"
              />
              {errors.available_units && <p className="text-sm text-destructive">{errors.available_units.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rera_number">RERA Number</Label>
            <Input
              id="rera_number"
              {...register('rera_number')}
              placeholder="Enter RERA number (optional)"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}