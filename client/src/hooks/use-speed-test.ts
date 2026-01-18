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
    const sizeBytes = 35_000_000; // 35MB - balanced for speed/accuracy (~5-10s)
    const start = performance.now();
    
    const response = await fetch(`${api.speedtest.download.path}?size=${sizeBytes}`, {
      signal: abortControllerRef.current?.signal
    });
    
    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    let receivedBytes = 0;
    
    while(true) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.length;
      
      const elapsed = (performance.now() - start) / 1000;
      if (elapsed > 0.1) { // Wait for stable measurement
        const bits = receivedBytes * 8;
        const mbps = (bits / elapsed) / 1_000_000;
        setStats(prev => ({ ...prev, download: parseFloat(mbps.toFixed(2)) }));
      }
    }
    
    const end = performance.now();
    const durationSeconds = (end - start) / 1000;
    const finalMbps = ((receivedBytes * 8) / durationSeconds) / 1_000_000;
    
    setStats(prev => ({ ...prev, download: parseFloat(finalMbps.toFixed(2)), progress: 60 }));
    return finalMbps;
  };

  const runUploadTest = async () => {
    const sizeBytes = 12_000_000; // 12MB - balanced (~3-5s)
    const payload = new Uint8Array(sizeBytes);
    const start = performance.now();

    // Since native fetch doesn't give upload progress, we use the average speed
    // but the final result is 100% accurate based on actual time taken.
    const resultPromise = fetch(api.speedtest.upload.path, {
      method: 'POST',
      body: payload,
      signal: abortControllerRef.current?.signal
    });

    const progressInterval = setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      const progress = Math.min(elapsed / 4, 0.95); // Assuming ~4s upload
      const bits = (sizeBytes * progress) * 8;
      const mbps = (bits / elapsed) / 1_000_000;
      if (elapsed > 0.1) {
        setStats(prev => ({ ...prev, upload: parseFloat(mbps.toFixed(2)) }));
      }
    }, 100);

    await resultPromise;
    clearInterval(progressInterval);
    
    const end = performance.now();
    const durationSeconds = (end - start) / 1000;
    const finalMbps = ((sizeBytes * 8) / durationSeconds) / 1_000_000;
    
    setStats(prev => ({ ...prev, upload: parseFloat(finalMbps.toFixed(2)), progress: 100 }));
    return finalMbps;
  };

  const startTest = useCallback(async () => {
    if (status !== 'idle' && status !== 'complete' && status !== 'error') return;

    setStatus('pinging');
    setStats({ ping: 0, jitter: 0, download: 0, upload: 0, progress: 0 });
    abortControllerRef.current = new AbortController();

    try {
      // Fetch IP info first - use HTTPS for browser safety if possible, or fallback to relative/server proxy
      // ip-api.com free tier is HTTP only. Let's try to handle it or use a more robust approach.
      let ipInfo = { query: '0.0.0.0', isp: 'Unknown ISP', city: 'Unknown', country: 'Unknown', mobile: false };
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const data = await ipRes.json();
          ipInfo = {
            query: data.ip,
            isp: data.org,
            city: data.city,
            country: data.country_name,
            mobile: false // ipapi.co doesn't provide this in free basic, we'll assume broadband
          };
        }
      } catch (e) {
        console.warn("Geo info fetch failed, using fallbacks", e);
      }

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
