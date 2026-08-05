import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { menuApi } from '../../services/api';
import type { MenuItem } from '../../types';

const schema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().min(8),
  price: z.coerce.number().min(0),
  imageUrl: z.string().url(),
  isAvailable: z.boolean().default(true),
});
type Input = z.infer<typeof schema>;

const friendlyNames: Record<string, string> = {
  categoryId: 'Category ID',
  name: 'Item Name',
  price: 'Price (₹)',
  imageUrl: 'Image URL',
};

export function MenuForm({ item, onDone }: { item?: MenuItem; onDone?: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: item ? { ...item, price: Number(item.price) } : { categoryId: 'cat-pizza', isAvailable: true },
  });

  useEffect(() => {
    if (item) {
      reset({
        categoryId: item.categoryId,
        name: item.name,
        price: Number(item.price),
        imageUrl: item.imageUrl,
        description: item.description,
        isAvailable: item.isAvailable,
      });
    } else {
      reset({ categoryId: 'cat-pizza', name: '', price: 0, imageUrl: '', description: '', isAvailable: true });
    }
  }, [item, reset]);
  
  const mutation = useMutation({
    mutationFn: (input: Input) => {
      const payload: Partial<MenuItem> = {
        ...input,
        price: String(input.price),
      };
      return item ? menuApi.update(item.id, payload) : menuApi.create(payload);
    },
    onSuccess: () => {
      toast.success(item ? 'Menu item successfully updated!' : 'Menu item successfully created!');
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      reset();
      onDone?.();
    },
    onError: () => toast.error('Menu save failed. Please verify fields.'),
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4 md:grid-cols-2">
      {(['categoryId', 'name', 'price', 'imageUrl'] as const).map((name) => (
        <label key={name} className="block text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-350">{friendlyNames[name] || name}</span>
          <input
            {...register(name)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
          />
          {errors[name] && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors[name]?.message}</span>}
        </label>
      ))}
      
      <label className="block text-sm md:col-span-2">
        <span className="font-semibold text-slate-700 dark:text-slate-350">Description</span>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
        />
        {errors.description && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.description.message}</span>}
      </label>

      <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          {...register('isAvailable')}
          className="h-4.5 w-4.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Available for ordering
      </label>

      <button className="btn-primary md:col-start-2">
        {item ? 'Update Item' : 'Create Item'}
      </button>
    </form>
  );
}

