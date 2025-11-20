import { supabase } from '@/integrations/supabase/client';

export interface DataSource {
  id: string;
  name: string;
  source_type: 'api' | 'aggregator' | 'regulator' | 'feed' | 'scraper';
  provider_name: string;
  status: 'active' | 'paused' | 'error' | 'disabled';
  configuration: any;
  sync_frequency: string;
  last_sync_at: string | null;
  next_sync_at: string | null;
  error_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface IngestionJob {
  id: string;
  data_source_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  job_type: 'scheduled' | 'manual' | 'webhook';
  started_at: string | null;
  completed_at: string | null;
  products_found: number;
  products_new: number;
  products_updated: number;
  products_duplicates: number;
  products_errors: number;
  error_message: string | null;
  metadata: any;
  created_at: string;
}

export interface IngestionLog {
  id: string;
  job_id: string;
  log_level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  product_id: string | null;
  details: any;
  created_at: string;
}

/**
 * Get all data sources
 */
export async function getDataSources(): Promise<DataSource[]> {
  const { data, error } = await supabase
    .from('data_sources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get a specific data source by ID
 */
export async function getDataSource(id: string): Promise<DataSource> {
  const { data, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new data source
 */
export async function createDataSource(dataSource: Omit<DataSource, 'id' | 'created_at' | 'updated_at'>): Promise<DataSource> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('data_sources')
    .insert({
      ...dataSource,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a data source
 */
export async function updateDataSource(id: string, updates: Partial<DataSource>): Promise<DataSource> {
  const { data, error } = await supabase
    .from('data_sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a data source
 */
export async function deleteDataSource(id: string): Promise<void> {
  const { error } = await supabase
    .from('data_sources')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Start a manual ingestion job
 */
export async function startIngestion(dataSourceId: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke('data-ingestion', {
    body: {
      action: 'start_ingestion',
      data_source_id: dataSourceId,
      job_type: 'manual',
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Get ingestion job status
 */
export async function getJobStatus(jobId: string): Promise<{ job: IngestionJob; logs: IngestionLog[] }> {
  const { data, error } = await supabase.functions.invoke('data-ingestion', {
    body: {
      action: 'get_job_status',
      job_id: jobId,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Cancel a running ingestion job
 */
export async function cancelJob(jobId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('data-ingestion', {
    body: {
      action: 'cancel_job',
      job_id: jobId,
    },
  });

  if (error) throw error;
}

/**
 * Get all ingestion jobs
 */
export async function getIngestionJobs(dataSourceId?: string): Promise<IngestionJob[]> {
  let query = supabase
    .from('ingestion_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (dataSourceId) {
    query = query.eq('data_source_id', dataSourceId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get ingestion logs for a job
 */
export async function getIngestionLogs(jobId: string): Promise<IngestionLog[]> {
  const { data, error } = await supabase
    .from('ingestion_logs')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Run consistency check on all products
 */
export async function runConsistencyCheck(): Promise<any> {
  const { data, error } = await supabase.functions.invoke('consistency-check', {
    body: {
      action: 'check_all',
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Run consistency check on a specific product
 */
export async function checkProductConsistency(productId: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke('consistency-check', {
    body: {
      action: 'check_product',
      product_id: productId,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Get consistency alerts
 */
export async function getConsistencyAlerts(status?: 'active' | 'acknowledged' | 'resolved' | 'ignored'): Promise<any[]> {
  let query = supabase
    .from('consistency_alerts')
    .select(`
      *,
      product_catalog (
        product_name,
        insurer_name,
        policy_type
      )
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Update alert status
 */
export async function updateAlertStatus(
  alertId: string,
  status: 'active' | 'acknowledged' | 'resolved' | 'ignored'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const updates: any = { status };

  if (status === 'acknowledged') {
    updates.acknowledged_by = user?.id;
    updates.acknowledged_at = new Date().toISOString();
  } else if (status === 'resolved') {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('consistency_alerts')
    .update(updates)
    .eq('id', alertId);

  if (error) throw error;
}

/**
 * Get duplicate detections
 */
export async function getDuplicateDetections(status?: 'pending' | 'confirmed' | 'false_positive' | 'ignored'): Promise<any[]> {
  let query = supabase
    .from('duplicate_detections')
    .select(`
      *,
      product:product_catalog!duplicate_detections_product_id_fkey (
        product_name,
        insurer_name,
        policy_type
      ),
      duplicate_product:product_catalog!duplicate_detections_duplicate_product_id_fkey (
        product_name,
        insurer_name,
        policy_type
      )
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Update duplicate detection status
 */
export async function updateDuplicateStatus(
  detectionId: string,
  status: 'pending' | 'confirmed' | 'false_positive' | 'ignored',
  notes?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('duplicate_detections')
    .update({
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      notes,
    })
    .eq('id', detectionId);

  if (error) throw error;
}
