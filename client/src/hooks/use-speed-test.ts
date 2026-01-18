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
    // Warmup
    await fetch(`${api.speedtest.download.path}?size=500000`, { 
      signal: abortControllerRef.current?.signal 
    });
    
    const sizeBytes = 25_000_000; // 25MB
    const start = performance.now();
    
    // In a real browser env, we can't track progress of a single fetch easily without streams
    // For visual effect we'll just wait for the promise
    const response = await fetch(`${api.speedtest.download.path}?size=${sizeBytes}`, {
      signal: abortControllerRef.current?.signal
    });
    
    await response.blob();
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
    await fetch(api.speedtest.upload.path, {
      method: 'POST',
      body: payload,
      signal: abortControllerRef.current?.signal
    });
    const end = performance.now();
    
    const durationSeconds = (end - start) / 1000;
    const bits = sizeBytes * 8;
    const mbps = (bits / durationSeconds) / 1_000_000;
    
    setStats(prev => ({ ...prev, upload: parseFloat(mbps.toFixed(2)), progress: 100 }));
    return mbps;
  };

  const startTest = useCallback(async () => {
    if (status !== 'idle' && status !== 'complete' && status !== 'error') return;

    // Reset
    setStatus('pinging');
    setStats({ ping: 0, jitter: 0, download: 0, upload: 0, progress: 0 });
    abortControllerRef.current = new AbortController();

    try {
      // 1. Ping
      const { ping, jitter } = await runPingTest();
      
      // 2. Download
      setStatus('downloading');
      const downloadSpeed = await runDownloadTest();
      
      // 3. Upload
      setStatus('uploading');
      const uploadSpeed = await runUploadTest();
      
      // 4. Finish
      setStatus('complete');
      
      // 5. Save
      try {
        await saveResult({
          ping,
          jitter,
          downloadSpeed,
          uploadSpeed,
          ipAddress: '127.0.0.1' // In real app, server extracts this
        });
        toast({ title: "Test Complete", description: "Results saved to history." });
      } catch (e) {
        console.error("Failed to save result", e);
        toast({ title: "Warning", description: "Test finished but failed to save history.", variant: "destructive" });
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setStatus('idle');
      } else {
        console.error(error);
        setStatus('error');
        toast({ title: "Error", description: "Network test failed. Please check your connection.", variant: "destructive" });
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
