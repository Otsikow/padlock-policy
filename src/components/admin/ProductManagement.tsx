import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  CheckCircle,
  XCircle,
  Pause,
  Eye,
  Package,
  Plus,
  AlertTriangle,
  PoundSterling,
} from 'lucide-react';

type Product = Tables<'products'>;
type Company = Tables<'insurance_companies'>;

interface ProductManagementProps {
  onUpdate?: () => void;
}

export function ProductManagement({ onUpdate }: ProductManagementProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New product form state
  const [newProduct, setNewProduct] = useState({
    company_id: '',
    product_name: '',
    product_type: 'health' as const,
    description: '',
    base_premium: '',
    currency: 'GBP',
    premium_frequency: 'monthly',
    coverage_amount: '',
    excess_amount: '',
    min_age: '',
    max_age: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCompanies();
  }, [filterStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('id, company_name, status')
        .eq('status', 'approved')
        .order('company_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const updateProductStatus = async (
    productId: string,
    status: 'approved' | 'rejected' | 'paused' | 'active',
    notes: string
  ) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          status,
          admin_notes: notes,
          ...(status === 'approved' && {
            approved_at: new Date().toISOString(),
            approved_by: user?.id,
          }),
          ...(status === 'rejected' && {
            rejection_reason: notes,
          }),
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Product ${status} successfully`,
      });

      fetchProducts();
      onUpdate?.();
      setActionDialogOpen(false);
      setActionNotes('');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product status',
        variant: 'destructive',
      });
    }
  };

  const createProduct = async () => {
    try {
      const { error } = await supabase.from('products').insert([
        {
          company_id: newProduct.company_id,
          product_name: newProduct.product_name,
          product_type: newProduct.product_type,
          description: newProduct.description,
          base_premium: parseFloat(newProduct.base_premium),
          currency: newProduct.currency,
          premium_frequency: newProduct.premium_frequency,
          coverage_amount: newProduct.coverage_amount ? parseFloat(newProduct.coverage_amount) : null,
          excess_amount: newProduct.excess_amount ? parseFloat(newProduct.excess_amount) : null,
          min_age: newProduct.min_age ? parseInt(newProduct.min_age) : null,
          max_age: newProduct.max_age ? parseInt(newProduct.max_age) : null,
          status: 'active',
          data_source: 'manual',
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });

      setCreateDialogOpen(false);
      setNewProduct({
        company_id: '',
        product_name: '',
        product_type: 'health',
        description: '',
        base_premium: '',
        currency: 'GBP',
        premium_frequency: 'monthly',
        coverage_amount: '',
        excess_amount: '',
        min_age: '',
        max_age: '',
      });
      fetchProducts();
      onUpdate?.();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
      draft: { variant: 'outline', color: 'gray' },
      pending: { variant: 'outline', color: 'yellow' },
      approved: { variant: 'default', color: 'blue' },
      rejected: { variant: 'destructive', color: 'red' },
      paused: { variant: 'secondary', color: 'orange' },
      active: { variant: 'default', color: 'green' },
      archived: { variant: 'secondary', color: 'gray' },
    };

    const config = variants[status] || variants.draft;

    return (
      <Badge variant={config.variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const ActionDialog = () => (
    <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Product Status</DialogTitle>
          <DialogDescription>
            {selectedProduct?.product_name} - Choose an action
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Admin Notes / Rejection Reason</Label>
            <Textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Add notes about this decision..."
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => selectedProduct && updateProductStatus(selectedProduct.id, 'approved', actionNotes)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => selectedProduct && updateProductStatus(selectedProduct.id, 'active', actionNotes)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate
            </Button>
            <Button
              onClick={() => selectedProduct && updateProductStatus(selectedProduct.id, 'rejected', actionNotes)}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => selectedProduct && updateProductStatus(selectedProduct.id, 'paused', actionNotes)}
              variant="secondary"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const CreateProductDialog = () => (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>Add a new insurance product manually</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Insurance Company *</Label>
            <Select
              value={newProduct.company_id}
              onValueChange={(value) => setNewProduct({ ...newProduct, company_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={newProduct.product_name}
                onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                placeholder="e.g., Comprehensive Health Cover"
              />
            </div>
            <div>
              <Label>Product Type *</Label>
              <Select
                value={newProduct.product_type}
                onValueChange={(value: any) => setNewProduct({ ...newProduct, product_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="life">Life</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="pet">Pet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Base Premium (£) *</Label>
              <Input
                type="number"
                step="0.01"
                value={newProduct.base_premium}
                onChange={(e) => setNewProduct({ ...newProduct, base_premium: e.target.value })}
                placeholder="99.99"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={newProduct.currency}
                onValueChange={(value) => setNewProduct({ ...newProduct, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select
                value={newProduct.premium_frequency}
                onValueChange={(value) => setNewProduct({ ...newProduct, premium_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-off">One-off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Coverage Amount (£)</Label>
              <Input
                type="number"
                step="0.01"
                value={newProduct.coverage_amount}
                onChange={(e) => setNewProduct({ ...newProduct, coverage_amount: e.target.value })}
                placeholder="100000"
              />
            </div>
            <div>
              <Label>Excess Amount (£)</Label>
              <Input
                type="number"
                step="0.01"
                value={newProduct.excess_amount}
                onChange={(e) => setNewProduct({ ...newProduct, excess_amount: e.target.value })}
                placeholder="500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Age</Label>
              <Input
                type="number"
                value={newProduct.min_age}
                onChange={(e) => setNewProduct({ ...newProduct, min_age: e.target.value })}
                placeholder="18"
              />
            </div>
            <div>
              <Label>Maximum Age</Label>
              <Input
                type="number"
                value={newProduct.max_age}
                onChange={(e) => setNewProduct({ ...newProduct, max_age: e.target.value })}
                placeholder="65"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={createProduct} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ViewDialog = () => (
    <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedProduct?.product_name}</DialogTitle>
          <DialogDescription>Product Details</DialogDescription>
        </DialogHeader>
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Product Type</Label>
                <p className="font-medium capitalize">{selectedProduct.product_type}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Base Premium</Label>
                <p className="font-medium">
                  {selectedProduct.currency} {selectedProduct.base_premium} / {selectedProduct.premium_frequency}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Coverage Amount</Label>
                <p className="font-medium">
                  {selectedProduct.coverage_amount
                    ? `${selectedProduct.currency} ${selectedProduct.coverage_amount}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Excess</Label>
                <p className="font-medium">
                  {selectedProduct.excess_amount
                    ? `${selectedProduct.currency} ${selectedProduct.excess_amount}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Age Range</Label>
                <p className="font-medium">
                  {selectedProduct.min_age || 'Any'} - {selectedProduct.max_age || 'Any'}
                </p>
              </div>
            </div>

            {selectedProduct.description && (
              <div>
                <Label className="text-xs text-gray-500">Description</Label>
                <p className="text-sm">{selectedProduct.description}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Views</Label>
                <p className="font-medium">{selectedProduct.view_count}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Clicks</Label>
                <p className="font-medium">{selectedProduct.click_count}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Conversions</Label>
                <p className="font-medium">{selectedProduct.conversion_count}</p>
              </div>
            </div>

            {selectedProduct.admin_notes && (
              <div>
                <Label className="text-xs text-gray-500">Admin Notes</Label>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedProduct.admin_notes}</p>
              </div>
            )}

            {selectedProduct.rejection_reason && (
              <div>
                <Label className="text-xs text-gray-500">Rejection Reason</Label>
                <p className="text-sm bg-red-50 p-3 rounded text-red-800">
                  {selectedProduct.rejection_reason}
                </p>
              </div>
            )}

            {Array.isArray(selectedProduct.ai_risk_flags) && selectedProduct.ai_risk_flags.length > 0 && (
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  AI Risk Flags
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedProduct.ai_risk_flags.map((flag: any, index: number) => (
                    <Badge key={index} variant="destructive">
                      {typeof flag === 'string' ? flag : JSON.stringify(flag)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              Product Management
            </h2>
            <p className="text-gray-600 mt-1">Manage and approve insurance products</p>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell className="capitalize">{product.product_type}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <PoundSterling className="h-3 w-3" />
                        {product.base_premium}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>{product.view_count}</TableCell>
                    <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProduct(product);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setActionDialogOpen(true);
                          }}
                        >
                          Manage
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ActionDialog />
      <ViewDialog />
      <CreateProductDialog />
    </div>
  );
}
