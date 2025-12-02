import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Store, Upload, Package, GripVertical, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const productSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Preço deve ser maior que 0"),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Stock deve ser 0 ou maior"),
  image_url: z.string().url("URL inválida").optional().or(z.literal("")),
  category: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
});

interface SortableProductCardProps {
  product: any;
  index: number;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

function SortableProductCard({ product, index, onEdit, onDelete }: SortableProductCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-full"
    >
      <Card className="p-3 h-[150px] flex items-center gap-3">
        {/* Drag Handle e Badges */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 z-10">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted rounded bg-background/80 backdrop-blur-sm"
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <Badge variant="outline" className="font-mono text-xs bg-background/80 backdrop-blur-sm">
            #{index + 1}
          </Badge>
          {product.is_mock && (
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
              Mock
            </Badge>
          )}
        </div>

        {/* Imagem */}
        <div className="flex-shrink-0 w-28 h-full">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex-1 flex flex-col h-full justify-between pt-6 pb-1">
          <div className="space-y-0.5">
            <h3 className="font-medium line-clamp-1 text-sm">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {product.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="font-mono text-xs">
                {product.price} MT
              </Badge>
              <Badge variant="outline" className="text-xs">
                Stock: {product.stock}
              </Badge>
              {product.category && (
                <Badge variant="outline" className="text-xs">{product.category}</Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                  Destaque
                </Badge>
              )}
              {product.is_new && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 text-xs">
                  Novo
                </Badge>
              )}
              {product.discount_percentage > 0 && (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 text-xs">
                  -{product.discount_percentage}%
                </Badge>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => onEdit(product)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("custom");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "0",
      image_url: "",
      category: "",
      is_featured: false,
      is_new: false,
      discount_percentage: 0,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      if (storeData) {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("store_id", storeData.id)
          .order("display_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Imagem muito grande. Máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Apenas imagens são permitidas",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${store.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      form.setValue("image_url", publicUrl);
      toast({ title: "Imagem carregada com sucesso!" });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro ao carregar imagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof productSchema>) => {
    if (!store) {
      toast({
        title: "Erro",
        description: "Cria primeiro a tua loja",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update({
            name: values.name,
            description: values.description || null,
            price: parseFloat(values.price),
            stock: parseInt(values.stock),
            image_url: values.image_url || null,
            category: values.category || null,
            is_featured: values.is_featured || false,
            is_new: values.is_new || false,
            discount_percentage: values.discount_percentage || 0,
          })
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado!",
        });
      } else {
        const { error } = await supabase
          .from("products")
          .insert({
            store_id: store.id,
            name: values.name,
            description: values.description || null,
            price: parseFloat(values.price),
            stock: parseInt(values.stock),
            image_url: values.image_url || null,
            category: values.category || null,
            is_featured: values.is_featured || false,
            is_new: values.is_new || false,
            discount_percentage: values.discount_percentage || 0,
            display_order: products.length,
          });

        if (error) throw error;

        toast({
          title: "Produto adicionado!",
        });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset();
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || "",
      category: product.category || "",
      is_featured: product.is_featured || false,
      is_new: product.is_new || false,
      discount_percentage: product.discount_percentage || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", productToDelete);
      if (error) throw error;

      toast({
        title: "Produto eliminado!",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProductToDelete(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);

    const newProducts = arrayMove(products, oldIndex, newIndex);
    setProducts(newProducts);

    try {
      const updates = newProducts.map((product, index) => ({
        id: product.id,
        display_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("products")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
      }
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Erro ao reordenar",
        description: error.message,
        variant: "destructive",
      });
      loadData();
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "mostSold":
        return (b.sold || 0) - (a.sold || 0);
      case "custom":
      default:
        return (a.display_order || 0) - (b.display_order || 0);
    }
  });

  return loading ? (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-28 mb-1.5" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3 h-[150px]">
            <Skeleton className="w-full h-full" />
          </Card>
        ))}
      </div>
    </div>
  ) : !store ? (
    <div className="flex items-center justify-center min-h-[350px]">
      <Card className="max-w-md w-full p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Cria a tua primeira loja antes de adicionar produtos.
        </p>
        <Link to="/dashboard/store/edit">
          <Button>Criar Loja</Button>
        </Link>
      </Card>
    </div>
  ) : (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie o catálogo da tua loja · {products.length} produtos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingProduct(null);
                form.reset();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Adicionar Produto"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* ... keep existing code (form fields) */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Roupas, Eletrônicos..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || 0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Label>Imagem do Produto</Label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors">
                        <Upload className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm text-center">Carregar imagem</p>
                        <p className="text-xs text-muted-foreground text-center">PNG, JPG até 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                    {form.watch("image_url") && (
                      <img
                        src={form.watch("image_url")}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ou cole a URL:</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Produto em Destaque</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Aparece na seção de destaques
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_new"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Produto Novo</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Marcado como "Novo"
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingProduct(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduct ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Ordenar:</span>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Ordem Personalizada</SelectItem>
            <SelectItem value="newest">Mais Recente</SelectItem>
            <SelectItem value="oldest">Mais Antigo</SelectItem>
            <SelectItem value="mostSold">Mais Vendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {products.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-1.5">Nenhum produto ainda</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Adiciona o teu primeiro produto para começar a vender
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Produto
          </Button>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedProducts.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedProducts.map((product, index) => (
                <SortableProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tens a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Products;
