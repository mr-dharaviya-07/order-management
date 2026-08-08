import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { X } from 'lucide-react';
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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: menuApi.categories,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Input>({
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

  const createCategoryMutation = useMutation({
    mutationFn: (newCat: { name: string; description?: string }) => menuApi.createCategory(newCat),
    onSuccess: (data) => {
      toast.success('Category created successfully!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setValue('categoryId', data.id);
      setIsCategoryModalOpen(false);
      setCategoryName('');
      setCategoryDescription('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create category');
    }
  });

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    createCategoryMutation.mutate({ name: categoryName.trim(), description: categoryDescription.trim() });
  };

  return (
    <>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid gap-4 md:grid-cols-2">
        {(['categoryId', 'name', 'price', 'imageUrl'] as const).map((name) => (
          <div key={name} className="block text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-350">{friendlyNames[name] || name}</span>
              {name === 'categoryId' && (
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-350 transition-colors cursor-pointer"
                >
                  + Add New
                </button>
              )}
            </div>
            {name === 'categoryId' ? (
              <select
                {...register(name)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-900 px-3.5 py-3 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white cursor-pointer"
              >
                <option value="" disabled>Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {cat.name} ({cat.id})
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...register(name)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            )}
            {errors[name] && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors[name]?.message}</span>}
          </div>
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

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/60 bg-white p-6 shadow-premium dark:border-slate-800/80 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">✨ Create New Category</h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Beverages, Sides"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Describe this category..."
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white/60 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-xs font-semibold text-white hover:from-brand-500 hover:to-brand-600 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

