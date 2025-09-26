import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Certificate {
  id: string;
  name: string;
  event_name: string;
  recipient_user_id: string;
  recipient_name: string;
  certificate_type: 'participation' | 'completion' | 'achievement';
  download_url?: string;
  issue_date: string;
  created_by: string;
  created_at: string;
}

export const useCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, isAdmin } = useAuth();

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('certificates').select('*');
      
      // If not admin, only show user's own certificates
      if (!isAdmin && session?.user) {
        query = query.eq('recipient_user_id', session.user.id);
      }
      
      const { data, error } = await query.order('issue_date', { ascending: false });

      if (error) throw error;

      setCertificates(data as Certificate[] || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCertificate = async (certificateData: Omit<Certificate, 'id' | 'created_by' | 'created_at'>) => {
    if (!session?.user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('certificates')
        .insert([
          {
            ...certificateData,
            created_by: session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await fetchCertificates(); // Refresh the certificates list
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const uploadCertificateFile = async (file: File, userId: string, certificateId: string) => {
    if (!session?.user) throw new Error('User not authenticated');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${certificateId}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      return { data: { path: data.path, publicUrl }, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const downloadCertificate = async (certificateId: string, fileName: string) => {
    if (!session?.user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.storage
        .from('certificates')
        .download(fileName);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  useEffect(() => {
    if (session) {
      fetchCertificates();
    }
  }, [session, isAdmin]);

  return {
    certificates,
    loading,
    error,
    fetchCertificates,
    createCertificate,
    uploadCertificateFile,
    downloadCertificate,
  };
};