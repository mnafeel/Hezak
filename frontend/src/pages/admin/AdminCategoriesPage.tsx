import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  createCategory,
  deleteCategory,
  updateCategory,
  updateCategoryProducts
} from '../../lib/api';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import { showError } from '../../lib/errorHandler';
import type { Category, CategoryFormPayload } from '../../types';

const emptyCategory: CategoryFormPayload = {
  name: '',
  slug: '',
  description: '',
  isTopSelling: false,
  isFeatured: false
};

const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useAdminCategories();
  const { data: products = [] } = useAdminProducts();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assignmentCategoryId, setAssignmentCategoryId] = useState<number | null>(null);
  const [assignedProductIds, setAssignedProductIds] = useState<number[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CategoryFormPayload>({
    defaultValues: emptyCategory
  });

  // Watch both checkboxes
  const isTopSelling = watch('isTopSelling');
  const isFeatured = watch('isFeatured');

  // Handle top selling change: if checked, uncheck featured (mutually exclusive)
  const handleTopSellingChange = (checked: boolean) => {
    if (checked) {
      // If checking top selling, uncheck featured first
      setValue('isFeatured', false);
      setValue('isTopSelling', true);
    } else {
      // If unchecking, just uncheck it
      setValue('isTopSelling', false);
    }
  };

  // Handle featured change: if checked, uncheck top selling (mutually exclusive)
  const handleFeaturedChange = (checked: boolean) => {
    if (checked) {
      // If checking featured, uncheck top selling first
      setValue('isTopSelling', false);
      setValue('isFeatured', true);
    } else {
      // If unchecking, just uncheck it
      setValue('isFeatured', false);
    }
  };

  const { mutateAsync: createMutation } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      // Invalidate both admin and storefront category queries so navbar updates immediately
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const { mutateAsync: updateMutation } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryFormPayload> }) =>
      updateCategory(id, data),
    onSuccess: () => {
      // Invalidate both admin and storefront category queries so navbar updates immediately
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const { mutateAsync: deleteMutation } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      // Invalidate both admin and storefront category queries so navbar updates immediately
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      if (error?.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        showError(error, 'Failed to delete category');
      }
    }
  });

  const { mutateAsync: updateCategoryProductsMutation, isPending: isAssigning } = useMutation({
    mutationFn: ({ id, productIds }: { id: number; productIds: number[] }) =>
      updateCategoryProducts(id, productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const onSubmit = async (values: CategoryFormPayload) => {
    try {
      // Only one can be selected: top selling OR featured, not both
      const payload: CategoryFormPayload = {
        name: values.name,
        slug: values.slug,
        description: values.description ?? '',
        isTopSelling: values.isTopSelling === true,
        isFeatured: values.isFeatured === true
      };
      
      const currentCategory = editingId 
        ? categories.find((cat) => cat.id === editingId)
        : null;
      
      // Check if setting as top selling and another category already has it
      if (payload.isTopSelling) {
        const existingTopSelling = categories.find(
          (cat) => cat.isTopSelling && cat.id !== editingId
        );

        if (existingTopSelling) {
          toast(
            `⚠️ "${existingTopSelling.name}" will be unset as top selling. "${payload.name}" is now the top selling category.`,
            { 
              duration: 5000,
              icon: '🔄',
              style: {
                background: '#fbbf24',
                color: '#1f2937',
                fontWeight: '500'
              }
            }
          );
        } else if (!currentCategory?.isTopSelling) {
          toast.success(`✅ "${payload.name}" is now set as the top selling category.`, {
            duration: 3000
          });
        }
      }

      // Check if setting as featured and another category already has it
      if (payload.isFeatured) {
        const existingFeatured = categories.find(
          (cat) => cat.isFeatured && cat.id !== editingId
        );

        if (existingFeatured) {
          toast(
            `⚠️ "${existingFeatured.name}" will be unset as featured. "${payload.name}" is now the featured category.`,
            { 
              duration: 5000,
              icon: '⭐',
              style: {
                background: '#fbbf24',
                color: '#1f2937',
                fontWeight: '500'
              }
            }
          );
        } else if (!currentCategory?.isFeatured) {
          toast.success(`✅ "${payload.name}" is now set as the featured category.`, {
            duration: 3000
          });
        }
      }
      
      if (editingId) {
        await updateMutation({ id: editingId, data: payload });
        if (!payload.isTopSelling && !payload.isFeatured) {
          toast.success('Category updated successfully');
        }
      } else {
        await createMutation(payload);
        if (!payload.isTopSelling && !payload.isFeatured) {
          toast.success('Category created successfully');
        }
      }
      setEditingId(null);
      setIsFormOpen(false);
      reset(emptyCategory);
    } catch (error) {
      showError(error, 'Failed to save category. Please check all fields and try again.');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setIsFormOpen(true);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      isTopSelling: category.isTopSelling ?? false,
      isFeatured: category.isFeatured ?? false
    });
  };

  const handleAddNew = () => {
    setEditingId(null);
    setIsFormOpen(true);
    reset(emptyCategory);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    reset(emptyCategory);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation(id);
      toast.success('Category deleted');
      if (editingId === id) {
        setEditingId(null);
        reset(emptyCategory);
      }
      if (assignmentCategoryId === id) {
        setAssignmentCategoryId(null);
        setAssignedProductIds([]);
      }
    } catch (error) {
      showError(error, 'Failed to delete category. Please try again.');
    }
  };

  const startAssigning = (category: Category) => {
    setAssignmentCategoryId(category.id);
    setAssignedProductIds(category.products?.map((product) => product.id) ?? []);
  };

  const toggleProductSelection = (productId: number) => {
    setAssignedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!assignmentCategoryId) {
      return;
    }

    try {
      await updateCategoryProductsMutation({
        id: assignmentCategoryId,
        productIds: assignedProductIds
      });
      toast.success('Category products updated');
      setAssignmentCategoryId(null);
      setAssignedProductIds([]);
    } catch (error) {
      showError(error, 'Failed to update category products. Please try again.');
    }
  };

  const cancelAssigning = () => {
    setAssignmentCategoryId(null);
    setAssignedProductIds([]);
  };

  return (
    <div className="space-y-8">
      <Card title="Categories" className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-200">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} created
          </p>
          <Button onClick={handleAddNew} size="lg">
            + Add Category
          </Button>
        </div>
        <div className="space-y-4">
          {categories.length ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-start justify-between rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    <Badge className="bg-white/10 text-slate-200">{category.slug}</Badge>
                    {category.isTopSelling && (
                      <Badge className="bg-brand-500/20 text-brand-200 border border-brand-400/30">
                        🔥 Top Selling
                      </Badge>
                    )}
                    {category.isFeatured && (
                      <Badge className="bg-purple-500/20 text-purple-200 border border-purple-400/30">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {category.description ?? 'No description provided'}
                  </p>
                  <p className="mt-3 text-xs text-slate-300">
                    {category.productCount} products linked
                  </p>
                  {category.products && category.products.length > 0 && (
                    <ul className="mt-3 space-y-1 text-xs text-slate-300">
                      {category.products.map((product) => (
                        <li key={product.id} className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-2 py-1">
                            <span className="font-medium text-white">{product.name}</span>
                            {product.itemType && (
                              <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-brand-200">
                                {product.itemType}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {assignmentCategoryId === category.id && (
                    <div className="mt-4 space-y-3 rounded-3xl border border-white/15 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">
                        Assign products to this category
                      </p>
                      <p className="text-xs text-slate-300">
                        Choose the items that should appear when shoppers browse{' '}
                        <span className="text-white">{category.name}</span>.
                      </p>
                      <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
                        {products.length ? (
                          products.map((product) => (
                            <label
                              key={product.id}
                              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                            >
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={assignedProductIds.includes(product.id)}
                                onChange={() => toggleProductSelection(product.id)}
                              />
                              <div className="space-y-1">
                                <p className="font-semibold text-white">{product.name}</p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                  {product.itemType && (
                                    <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-brand-200">
                                      {product.itemType}
                                    </span>
                                  )}
                                  {product.category && product.category.id !== category.id && (
                                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-red-200">
                                      Currently in {product.category.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))
                        ) : (
                          <p className="text-xs text-slate-300">No products available yet.</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleSaveAssignments}
                          disabled={isAssigning}
                        >
                          {isAssigning ? 'Saving…' : 'Save assignments'}
                        </Button>
                        <Button type="button" variant="ghost" onClick={cancelAssigning}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      assignmentCategoryId === category.id
                        ? cancelAssigning()
                        : startAssigning(category)
                    }
                  >
                    {assignmentCategoryId === category.id ? 'Close' : 'Manage products'}
                  </Button>
                  <Button variant="ghost" onClick={() => handleEdit(category)}>
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(category.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-200">No categories yet. Create your first one.</p>
          )}
        </div>
      </Card>

      {/* Category Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 top-4 bottom-4 z-50 mx-auto max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            >
              <Card title={editingId ? 'Update category' : 'Create category'}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {editingId ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <Button variant="ghost" onClick={handleCloseForm} className="shrink-0">
                    ✕ Close
                  </Button>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <Input
            label="Slug"
            {...register('slug', { required: 'Slug is required' })}
            error={errors.slug?.message}
          />
          <Textarea label="Description" {...register('description')} />
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <input
              type="checkbox"
              id="isTopSelling"
              checked={isTopSelling || false}
              onChange={(e) => handleTopSellingChange(e.target.checked)}
              className="h-5 w-5 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-2 focus:ring-brand-500"
            />
            <label htmlFor="isTopSelling" className="flex-1 cursor-pointer text-sm text-slate-200">
              <span className="font-semibold text-white">Mark as Top Selling Category</span>
              <p className="mt-1 text-xs text-slate-300">
                Products in this category will appear in the "Top Selling" section on the home page. Only one category can be selected. Selecting this will automatically uncheck "Featured".
              </p>
            </label>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured || false}
              onChange={(e) => handleFeaturedChange(e.target.checked)}
              className="h-5 w-5 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-2 focus:ring-brand-500"
            />
            <label htmlFor="isFeatured" className="flex-1 cursor-pointer text-sm text-slate-200">
              <span className="font-semibold text-white">Mark as Featured Category</span>
              <p className="mt-1 text-xs text-slate-300">
                Products in this category will appear in the "Featured Selections" section on the home page. Only one category can be selected. Selecting this will automatically uncheck "Top Selling".
              </p>
            </label>
          </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" size="lg" disabled={isSubmitting} className="flex-1">
                      {editingId ? 'Update category' : 'Create category'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseForm}
                      className="shrink-0"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategoriesPage;

