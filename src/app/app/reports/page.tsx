"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import * as jobsApi from '@/lib/jobs'
import { toast } from 'sonner'
import { Search, FileText, Plus, Calendar, User, AlertCircle, Copy } from 'lucide-react'

type Row = { job_id: string; status: string; title?: string; template_id?: string; created_at?: number };

export default function ReportsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const timers = useRef<Record<string, any>>({});

  function mergeLists(server: Row[], local: Row[]): Row[] {
    const map = new Map<string, Row>();
    [...local, ...server].forEach(r => {
      const id = r.job_id || (r as any).id;
      if (!id) return;
      const prev = map.get(id);
      if (!prev || (r.created_at || 0) > (prev.created_at || 0)) map.set(id, { ...prev, ...r });
    });
    return Array.from(map.values()).sort((a,b)=> (b.created_at||0)-(a.created_at||0));
  }

  async function load() {
    setLoading(true);
    setErr(null);
    
    try {
      const { data, error } = await jobsApi.recent(50);
      
      // Treat 404 as empty list (no error banner)
      if (error && error.status !== 404) {
        setErr(`${error.message}: ${error.status}`);
        setLoading(false);
        return;
      }
      
      const serverRows: Row[] = (data?.jobs ?? []).map((j: any) => ({
        job_id: String(j.job_id || j.id || ''),
        status: j.status || 'done',
        title: j.title || j.result?.report?.title || 'Report',
        template_id: j.template_id,
        created_at: Number(j.created_at || j.time || Date.now()),
      }));
      
      const local = JSON.parse(localStorage.getItem('radly_recent_jobs_local') || '[]');
      const merged = mergeLists(serverRows, local);
      setRows(merged);
      
      // Start polling for any that aren't final and have an id
      merged.forEach(r => {
        if (!r.job_id) return;
        if (r.status === 'done' || r.status === 'error') return;
        if (timers.current[r.job_id]) return;
        
        timers.current[r.job_id] = setInterval(async () => {
          const { data: st } = await jobsApi.status(r.job_id!);
          if (!st) return;
          
          setRows(curr => curr.map(x => x.job_id === r.job_id ? {
            ...x,
            status: st.status,
            title: st.result?.report?.title || x.title
          } : x));
          
          if (st.status === 'done' || st.status === 'error') {
            clearInterval(timers.current[r.job_id]);
            delete timers.current[r.job_id];
            
            // also update local cache
            const now = JSON.parse(localStorage.getItem('radly_recent_jobs_local') || '[]');
            const upd = now.map((x: Row) => x.job_id === r.job_id ? {
              ...x,
              status: st.status,
              title: st.result?.report?.title || x.title
            } : x);
            localStorage.setItem('radly_recent_jobs_local', JSON.stringify(upd));
          }
        }, 3000);
      });
      
    } catch (e) {
      console.error('Load error:', e);
      setErr('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    return () => { Object.values(timers.current).forEach(clearInterval); };
  }, []);

  // Filter rows based on search term
  const filteredRows = rows.filter(row =>
    row.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.template_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle retry
  const handleRetry = () => {
    load();
  }

  // Copy error details to clipboard
  const copyErrorDetails = () => {
    const errorText = `Error: ${err}`;
    navigator.clipboard.writeText(errorText);
    toast.success('Error details copied to clipboard');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your generated medical reports
          </p>
        </div>
        <Link href="/app/generate">
          <Button variant="default" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </Button>
        </Link>
      </div>

      {/* Error Display */}
      {err && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Failed to load reports</h3>
              <p className="text-sm text-red-700 mt-1">
                {err}
              </p>
              <div className="mt-3 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  Retry
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyErrorDetails}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Error Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No reports found' : 'No reports yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Generate your first medical report to get started'
            }
          </p>
          {!searchTerm && (
            <Link href="/app/generate">
              <Button variant="default" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create First Report</span>
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRows.map((row) => (
            <Card key={row.job_id} className="hover:bg-muted/60 transition border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {row.title || 'Untitled Report'}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Unknown date'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Status: {row.status || 'Unknown'}</span>
                      </span>
                    </CardDescription>
                  </div>
                  <Link href={`/app/report/${row.job_id}`}>
                    <Button variant="outline" size="sm">
                      View Report
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job ID</p>
                    <p className="text-foreground text-sm line-clamp-2">
                      {row.job_id || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Template</p>
                    <p className="text-foreground text-sm line-clamp-3">
                      {row.template_id || 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
