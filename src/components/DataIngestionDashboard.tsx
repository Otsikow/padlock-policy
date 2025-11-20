import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, RefreshCw, Database, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as ingestionService from '@/services/dataIngestionService';
import * as catalogService from '@/services/productCatalogService';

export default function DataIngestionDashboard() {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [sourcesData, jobsData, alertsData, duplicatesData, statsData] = await Promise.all([
        ingestionService.getDataSources(),
        ingestionService.getIngestionJobs(),
        ingestionService.getConsistencyAlerts('active'),
        ingestionService.getDuplicateDetections('pending'),
        catalogService.getProductStatistics(),
      ]);

      setDataSources(sourcesData);
      setJobs(jobsData);
      setAlerts(alertsData);
      setDuplicates(duplicatesData);
      setStats(statsData);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartIngestion = async (sourceId: string) => {
    try {
      toast.info('Starting ingestion...');
      await ingestionService.startIngestion(sourceId);
      toast.success('Ingestion started successfully');
      loadDashboardData();
    } catch (error: any) {
      toast.error(`Failed to start ingestion: ${error.message}`);
    }
  };

  const handleRunConsistencyCheck = async () => {
    try {
      toast.info('Running consistency checks...');
      await ingestionService.runConsistencyCheck();
      toast.success('Consistency check completed');
      loadDashboardData();
    } catch (error: any) {
      toast.error(`Failed to run consistency check: ${error.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: 'default',
      completed: 'default',
      running: 'default',
      pending: 'secondary',
      failed: 'destructive',
      error: 'destructive',
      paused: 'secondary',
    };

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI-Powered Data Ingestion</h1>
          <p className="text-muted-foreground">Automated insurance product feeds</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleRunConsistencyCheck}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Run Consistency Check
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.active || 0} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataSources.length}</div>
            <p className="text-xs text-muted-foreground">
              {dataSources.filter(s => s.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === 'critical').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Duplicates</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{duplicates.length}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="jobs">Ingestion Jobs</TabsTrigger>
          <TabsTrigger value="alerts">Consistency Alerts</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Manage automated insurance data feeds</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell className="font-medium">{source.name}</TableCell>
                      <TableCell>{source.source_type}</TableCell>
                      <TableCell>{source.provider_name}</TableCell>
                      <TableCell>{getStatusBadge(source.status)}</TableCell>
                      <TableCell>
                        {source.last_sync_at
                          ? new Date(source.last_sync_at).toLocaleString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleStartIngestion(source.id)}
                          disabled={source.status !== 'active'}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Ingestion Jobs</CardTitle>
              <CardDescription>Monitor data ingestion progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Found</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Duplicates</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-xs">
                        {job.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{job.job_type}</TableCell>
                      <TableCell>{job.products_found}</TableCell>
                      <TableCell>{job.products_new}</TableCell>
                      <TableCell>{job.products_updated}</TableCell>
                      <TableCell>{job.products_duplicates}</TableCell>
                      <TableCell>
                        {job.started_at
                          ? new Date(job.started_at).toLocaleString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Consistency Alerts</CardTitle>
              <CardDescription>Products requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        {alert.product_catalog?.product_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{alert.alert_type}</TableCell>
                      <TableCell>{getStatusBadge(alert.severity)}</TableCell>
                      <TableCell>{alert.message}</TableCell>
                      <TableCell>
                        {new Date(alert.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates">
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Detections</CardTitle>
              <CardDescription>Review and manage duplicate products</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product A</TableHead>
                    <TableHead>Product B</TableHead>
                    <TableHead>Similarity</TableHead>
                    <TableHead>Matching Fields</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duplicates.map((dup) => (
                    <TableRow key={dup.id}>
                      <TableCell>{dup.product?.product_name || 'Unknown'}</TableCell>
                      <TableCell>
                        {dup.duplicate_product?.product_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{dup.similarity_score}%</TableCell>
                      <TableCell>{dup.matching_fields.join(', ')}</TableCell>
                      <TableCell>
                        {new Date(dup.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
