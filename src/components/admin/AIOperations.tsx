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
  Bot,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Settings,
  AlertCircle,
} from 'lucide-react';

type CrawlLog = Tables<'ai_crawl_logs'>;
type Company = Tables<'insurance_companies'>;

interface AIOperationsProps {
  onUpdate?: () => void;
}

export function AIOperations({ onUpdate }: AIOperationsProps) {
  const { user } = useAuth();
  const [crawlLogs, setCrawlLogs] = useState<CrawlLog[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [startCrawlDialogOpen, setStartCrawlDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CrawlLog | null>(null);
  const [viewLogDialogOpen, setViewLogDialogOpen] = useState(false);

  const [newCrawl, setNewCrawl] = useState({
    operation_type: 'scrape',
    target_url: '',
    target_company_id: '',
    crawl_rules: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchCrawlLogs();
    fetchCompanies();
  }, []);

  const fetchCrawlLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_crawl_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCrawlLogs(data || []);
    } catch (error) {
      console.error('Error fetching crawl logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI operation logs',
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
        .select('id, company_name')
        .eq('status', 'approved')
        .order('company_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const startCrawl = async () => {
    try {
      let crawlRulesJson = {};
      if (newCrawl.crawl_rules) {
        try {
          crawlRulesJson = JSON.parse(newCrawl.crawl_rules);
        } catch {
          toast({
            title: 'Invalid JSON',
            description: 'Crawl rules must be valid JSON',
            variant: 'destructive',
          });
          return;
        }
      }

      const { error } = await supabase.from('ai_crawl_logs').insert([
        {
          operation_type: newCrawl.operation_type,
          target_url: newCrawl.target_url || null,
          target_company_id: newCrawl.target_company_id || null,
          status: 'running',
          crawl_rules: crawlRulesJson,
          triggered_by: user?.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'AI crawl operation started',
      });

      setStartCrawlDialogOpen(false);
      setNewCrawl({
        operation_type: 'scrape',
        target_url: '',
        target_company_id: '',
        crawl_rules: '',
      });
      fetchCrawlLogs();
      onUpdate?.();
    } catch (error) {
      console.error('Error starting crawl:', error);
      toast({
        title: 'Error',
        description: 'Failed to start crawl operation',
        variant: 'destructive',
      });
    }
  };

  const updateCrawlStatus = async (logId: string, status: 'running' | 'completed' | 'failed' | 'paused') => {
    try {
      const updateData: any = { status };

      if (status === 'completed' || status === 'failed') {
        const log = crawlLogs.find(l => l.id === logId);
        if (log && log.started_at) {
          const duration = Math.floor((Date.now() - new Date(log.started_at).getTime()) / 1000);
          updateData.completed_at = new Date().toISOString();
          updateData.duration_seconds = duration;
        }
      }

      const { error } = await supabase
        .from('ai_crawl_logs')
        .update(updateData)
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Crawl operation ${status}`,
      });

      fetchCrawlLogs();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating crawl status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update crawl status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      running: { variant: 'default', icon: RefreshCw },
      completed: { variant: 'default', icon: CheckCircle },
      failed: { variant: 'destructive', icon: XCircle },
      paused: { variant: 'secondary', icon: Pause },
    };

    const { variant, icon: Icon } = config[status] || config.running;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className={`h-3 w-3 ${status === 'running' ? 'animate-spin' : ''}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const StartCrawlDialog = () => (
    <Dialog open={startCrawlDialogOpen} onOpenChange={setStartCrawlDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start AI Crawl Operation</DialogTitle>
          <DialogDescription>
            Configure and start a new data crawling or AI operation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Operation Type</Label>
            <Select
              value={newCrawl.operation_type}
              onValueChange={(value) => setNewCrawl({ ...newCrawl, operation_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scrape">Scrape Website</SelectItem>
                <SelectItem value="api_sync">API Synchronisation</SelectItem>
                <SelectItem value="normalize">Normalise Data</SelectItem>
                <SelectItem value="re-crawl">Re-crawl Existing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Target URL</Label>
            <Input
              value={newCrawl.target_url}
              onChange={(e) => setNewCrawl({ ...newCrawl, target_url: e.target.value })}
              placeholder="https://example.com/insurance-products"
            />
          </div>

          <div>
            <Label>Target Company (Optional)</Label>
            <Select
              value={newCrawl.target_company_id}
              onValueChange={(value) => setNewCrawl({ ...newCrawl, target_company_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company or leave blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific company</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Crawl Rules (JSON)</Label>
            <Textarea
              value={newCrawl.crawl_rules}
              onChange={(e) => setNewCrawl({ ...newCrawl, crawl_rules: e.target.value })}
              placeholder='{"selectors": {"price": ".product-price"}, "filters": {"minPrice": 10}}'
              className="font-mono text-sm"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter crawling configuration as JSON (optional)
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={startCrawl} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Crawl
            </Button>
            <Button variant="outline" onClick={() => setStartCrawlDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ViewLogDialog = () => (
    <Dialog open={viewLogDialogOpen} onOpenChange={setViewLogDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crawl Operation Details</DialogTitle>
          <DialogDescription>
            {selectedLog?.operation_type.toUpperCase()} - {selectedLog?.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Operation Type</Label>
                <p className="font-medium capitalize">{selectedLog.operation_type}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Started At</Label>
                <p className="font-medium">
                  {new Date(selectedLog.started_at).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Duration</Label>
                <p className="font-medium">{formatDuration(selectedLog.duration_seconds)}</p>
              </div>
            </div>

            {selectedLog.target_url && (
              <div>
                <Label className="text-xs text-gray-500">Target URL</Label>
                <p className="font-medium text-sm break-all">{selectedLog.target_url}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Products Found</Label>
                <p className="text-2xl font-bold text-blue-600">{selectedLog.products_found}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Products Created</Label>
                <p className="text-2xl font-bold text-green-600">
                  {selectedLog.products_created}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Products Updated</Label>
                <p className="text-2xl font-bold text-yellow-600">
                  {selectedLog.products_updated}
                </p>
              </div>
            </div>

            {Array.isArray(selectedLog.errors) && selectedLog.errors.length > 0 && (
              <div>
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  Errors
                </Label>
                <div className="bg-red-50 p-3 rounded mt-2 space-y-2">
                  {selectedLog.errors.map((error: any, index: number) => (
                    <p key={index} className="text-sm text-red-800 font-mono">
                      {typeof error === 'string' ? error : JSON.stringify(error)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {selectedLog.crawl_rules && Object.keys(selectedLog.crawl_rules).length > 0 && (
              <div>
                <Label className="text-xs text-gray-500">Crawl Rules</Label>
                <pre className="bg-gray-50 p-3 rounded mt-2 text-xs overflow-auto">
                  {JSON.stringify(selectedLog.crawl_rules, null, 2)}
                </pre>
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
              <Bot className="h-6 w-6" />
              AI Operations Control Panel
            </h2>
            <p className="text-gray-600 mt-1">
              Manage data crawling, API integrations, and AI processing
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCrawlLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setStartCrawlDialogOpen(true)}>
              <Play className="h-4 w-4 mr-2" />
              Start Crawl
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Running</p>
            <p className="text-2xl font-bold text-blue-600">
              {crawlLogs.filter((l) => l.status === 'running').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {crawlLogs.filter((l) => l.status === 'completed').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-2xl font-bold text-red-600">
              {crawlLogs.filter((l) => l.status === 'failed').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Paused</p>
            <p className="text-2xl font-bold text-yellow-600">
              {crawlLogs.filter((l) => l.status === 'paused').length}
            </p>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading AI operations...</p>
          </div>
        ) : crawlLogs.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No AI operations found</p>
            <Button onClick={() => setStartCrawlDialogOpen(true)} className="mt-4">
              Start First Crawl
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Found</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crawlLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium capitalize">
                      {log.operation_type}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{log.products_found}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {log.products_created}
                    </TableCell>
                    <TableCell className="text-yellow-600 font-medium">
                      {log.products_updated}
                    </TableCell>
                    <TableCell>{formatDuration(log.duration_seconds)}</TableCell>
                    <TableCell>
                      {new Date(log.started_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLog(log);
                            setViewLogDialogOpen(true);
                          }}
                        >
                          View
                        </Button>
                        {log.status === 'running' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateCrawlStatus(log.id, 'paused')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCrawlStatus(log.id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {log.status === 'paused' && (
                          <Button
                            size="sm"
                            onClick={() => updateCrawlStatus(log.id, 'running')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <StartCrawlDialog />
      <ViewLogDialog />
    </div>
  );
}
