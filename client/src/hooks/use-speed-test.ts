import { useState, useCallback, useRef } from 'react';
import { api } from "@shared/routes";
import { useCreateResult } from './use-results';
import { useToast } from './use-toast';

export type TestState = 'idle' | 'pinging' | 'downloading' | 'uploading' | 'complete' | 'error';

export interface LiveStats {
  ping: number; // ms
  jitter: number; // ms
  download: number; // Mbps
  upload: number; // Mbps
  progress: number; // 0-100 total progress
}

export function useSpeedTest() {
  const [status, setStatus] = useState<TestState>('idle');
  const [stats, setStats] = useState<LiveStats>({
    ping: 0,
    jitter: 0,
    download: 0,
    upload: 0,
    progress: 0
  });

  const { mutateAsync: saveResult } = useCreateResult();
  const { toast } = useToast();
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const runPingTest = async () => {
    const pings: number[] = [];
    // 5 pings
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await fetch(api.speedtest.ping.path, { 
        cache: 'no-store',
        signal: abortControllerRef.current?.signal 
      });
      const end = performance.now();
      pings.push(end - start);
      setStats(prev => ({ ...prev, progress: 5 + (i * 2) })); // 5-15%
    }
    
    const min = Math.min(...pings);
    const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
    const jitter = Math.abs(avg - min); // Simplified jitter
    
    setStats(prev => ({ ...prev, ping: Math.round(min), jitter: Math.round(jitter) }));
    return { ping: Math.round(min), jitter: Math.round(jitter) };
  };

  const runDownloadTest = async () => {
    const sizeBytes = 25_000_000; // 25MB
    const start = performance.now();
    
    // Simulate real-time gauge movement during download
    const progressInterval = setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      // Estimate speed based on progress (dummy but visual)
      const estimatedSpeed = 20 + Math.random() * 30; 
      setStats(prev => ({ ...prev, download: parseFloat(estimatedSpeed.toFixed(2)) }));
    }, 100);

    const response = await fetch(`${api.speedtest.download.path}?size=${sizeBytes}`, {
      signal: abortControllerRef.current?.signal
    });
    
    await response.blob();
    clearInterval(progressInterval);
    
    const end = performance.now();
    const durationSeconds = (end - start) / 1000;
    const bits = sizeBytes * 8;
    const mbps = (bits / durationSeconds) / 1_000_000;
    
    setStats(prev => ({ ...prev, download: parseFloat(mbps.toFixed(2)), progress: 60 }));
    return mbps;
  };

  const runUploadTest = async () => {
    const sizeBytes = 10_000_000; // 10MB
    const payload = new Blob([new ArrayBuffer(sizeBytes)]);
    const start = performance.now();
    
    const progressInterval = setInterval(() => {
      const estimatedSpeed = 5 + Math.random() * 10;
      setStats(prev => ({ ...prev, upload: parseFloat(estimatedSpeed.toFixed(2)) }));
    }, 100);

    await fetch(api.speedtest.upload.path, {
      method: 'POST',
      body: payload,
      signal: abortControllerRef.current?.signal
    });
    
    clearInterval(progressInterval);
    const end = performance.now();
    const durationSeconds = (end - start) / 1000;
    const bits = sizeBytes * 8;
    const mbps = (bits / durationSeconds) / 1_000_000;
    
    setStats(prev => ({ ...prev, upload: parseFloat(mbps.toFixed(2)), progress: 100 }));
    return mbps;
  };

  const startTest = useCallback(async () => {
    if (status !== 'idle' && status !== 'complete' && status !== 'error') return;

    setStatus('pinging');
    setStats({ ping: 0, jitter: 0, download: 0, upload: 0, progress: 0 });
    abortControllerRef.current = new AbortController();

    try {
      // Fetch IP info first
      const ipRes = await fetch('http://ip-api.com/json/');
      const ipInfo = await ipRes.json();

      const { ping, jitter } = await runPingTest();
      
      setStatus('downloading');
      const downloadSpeed = await runDownloadTest();
      
      setStatus('uploading');
      const uploadSpeed = await runUploadTest();
      
      setStatus('complete');
      
      try {
        await saveResult({
          ping,
          jitter,
          downloadSpeed,
          uploadSpeed,
          ipAddress: ipInfo.query,
          isp: ipInfo.isp,
          city: ipInfo.city,
          country: ipInfo.country,
          connectionType: ipInfo.mobile ? 'Mobile' : 'Broadband'
        });
        toast({ title: "Test Complete", description: "Results saved to history." });
      } catch (e) {
        console.error("Failed to save result", e);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setStatus('idle');
      } else {
        console.error(error);
        setStatus('error');
        toast({ title: "Error", description: "Network test failed.", variant: "destructive" });
      }
    }
  }, [status, saveResult, toast]);

  const cancelTest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStatus('idle');
    }
  }, []);

  return { status, stats, startTest, cancelTest };
}
