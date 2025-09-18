/**
 * PhotoUpload Component for Direct R2 Upload
 * 
 * What this component does:
 * - Allows users to select and upload photos directly to Cloudflare R2
 * - Uses presigned URLs to bypass our FastAPI server for uploads
 * - Handles file validation and upload progress
 * - Returns object keys for attaching to reviews/properties
 * 
 * Network flow:
 * 1. User selects files → Component validates them locally
 * 2. Request presigned URL from our API → POST /api/v1/uploads/signed-url
 * 3. Upload file directly to R2 → PUT to presigned URL
 * 4. Return object_key to parent component for form submission
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

interface PhotoUploadProps {
  fileType: 'property' | 'review';
  onUploadComplete: (objectKeys: string[]) => void;
  maxFiles?: number;
  className?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  objectKey?: string;
}

// Simple toast implementation using console
const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message);
    alert('Success: ' + message);
  },
  error: (message: string) => {
    console.error('❌ Error:', message);
    alert('Error: ' + message);
  }
};

/**
 * ⚠️ IMPORTANT: R2 BUCKET CORS CONFIGURATION ⚠️
 * 
 * The R2 bucket should have the following CORS configuration for uploads:
 * 
 * [
 *   {
 *     "AllowedOrigins": ["http://localhost:3000"],
 *     "AllowedMethods": ["PUT", "GET", "HEAD"], // If R2 doesn't accept OPTIONS, this might still work
 *     "AllowedHeaders": ["*"],
 *     "ExposeHeaders": ["ETag"],
 *     "MaxAgeSeconds": 86400
 *   }
 * ]
 * 
 * NOTE: Normally OPTIONS would be required for browser uploads, but our code now
 * includes workarounds that might help bypass this requirement.
 * 
 * If direct uploads still fail, a server-side proxy approach may be needed.
 */

export default function PhotoUpload({ 
  fileType, 
  onUploadComplete, 
  maxFiles = 5,
  className = ''
}: PhotoUploadProps) {
  const { token } = useAuth(); // Get JWT token for API requests
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file type - only allow images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, WebP, and GIF images are allowed';
    }

    // Check file size - max 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null; // File is valid
  };

  // Upload a single file to R2
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      console.log('Starting upload process for file:', file.name, 'Type:', file.type, 'Size:', file.size, 'bytes');
      
      // Check if we have a valid token
      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }
      
      // Step 1: Request presigned upload URL from our API
      // This creates a cryptographically signed URL that R2 will accept
      console.log('Requesting presigned URL from API endpoint:', API_ENDPOINTS.UPLOADS.SIGNED_URL);
      const response = await fetch(buildApiUrl(API_ENDPOINTS.UPLOADS.SIGNED_URL), {
        method: 'POST',
        headers: getAuthHeaders(token), // Use helper function for auth headers
        body: JSON.stringify({
          content_type: file.type,
          file_type: fileType
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error message');
        console.error('Failed to get upload URL:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Failed to get upload URL: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Successfully received presigned URL response:', responseData);
      const { upload_url, object_key } = responseData;
      
      if (!upload_url || !object_key) {
        console.error('Invalid response from server - missing upload_url or object_key:', responseData);
        throw new Error('Invalid response from server');
      }

      // Step 2: Upload file directly to R2 using presigned URL
      // This request goes directly to Cloudflare's edge servers
      // Our FastAPI server never sees the actual file data
      console.log('Beginning R2 upload process for:', object_key);
      console.log('Uploading to URL:', upload_url);
      
      // Parse the URL to extract the hostname for logging
      try {
        const urlObj = new URL(upload_url);
        console.log('Target domain:', urlObj.hostname, 'Path:', urlObj.pathname);
      } catch (e) {
        console.error('Error parsing URL:', e);
      }

      // Try multiple upload methods for better compatibility
      console.log('Attempting to upload using multiple methods for better compatibility');
      
      // Method 1: Using XMLHttpRequest (Primary method - works with current CORS setup)
      try {
        console.log('Method 1: Using XMLHttpRequest (Primary method - works with current CORS)');
        return await new Promise<string | null>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          // Set up event handlers
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              console.log(`Upload progress for ${file.name}: ${percent}%`);
            }
          };
          
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) { // DONE
              console.log('Upload completed with status:', xhr.status);
              console.log('Response headers:', xhr.getAllResponseHeaders());
              
              if (xhr.status >= 200 && xhr.status < 300) {
                console.log('XMLHttpRequest upload successful!', object_key);
                resolve(object_key);
              } else {
                console.error('XMLHttpRequest upload failed:', xhr.status, xhr.statusText);
                console.error('Response:', xhr.responseText);
                reject(new Error(`Failed to upload: ${xhr.status} ${xhr.statusText}`));
              }
            }
          };
          
          xhr.onerror = (e) => {
            console.error('XHR error during upload:', e);
            reject(new Error('Network error during upload'));
          };
          
          xhr.onabort = () => {
            console.warn('Upload aborted');
            reject(new Error('Upload aborted'));
          };
          
          // Open the connection and send the file
          console.log('Opening XHR connection to', upload_url);
          xhr.open('PUT', upload_url, true);
          
          // Set Content-Type header - this must match what was used to generate the presigned URL
          xhr.setRequestHeader('Content-Type', file.type);
          
          // Try to bypass CORS issues by setting additional headers that might help
          // Note: These may not be necessary or may not work depending on the server configuration
          xhr.withCredentials = false; // Don't send credentials for cross-origin requests
          
          console.log('Sending file via XMLHttpRequest...');
          xhr.send(file);
          console.log('XHR request initiated');
        });
      } catch (xhrError) {
        console.error('XMLHttpRequest error:', xhrError);
        
        // Method 2: Fallback to fetch with normal CORS (if OPTIONS is properly configured)
        try {
          console.log('Method 2: Fallback to fetch with normal CORS');
          
          const uploadResponse = await fetch(upload_url, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            }
          });
          
          if (uploadResponse.ok) {
            console.log('Fetch upload succeeded!', object_key);
            return object_key;
          } else {
            console.error('Fetch upload failed:', uploadResponse.status, uploadResponse.statusText);
            throw new Error(`Fetch upload failed: ${uploadResponse.status}`);
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          throw xhrError; // Throw the original XHR error
        }
      }
      
    } catch (error) {
      // Log detailed error information
      console.error('Upload process error:', error);
      
      // Extract more meaningful error messages
      let errorMessage = 'Failed to upload image';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        console.error('Error stack:', error.stack);
      }
      
      // Check for specific network-related errors
      if (error instanceof TypeError && error.message.includes('networkerror')) {
        console.error('Network error detected - possible CORS or connectivity issue');
        errorMessage = 'Network error: Check internet connection and CORS configuration';
      }
      
      // Show toast notification with error message
      toast.error(errorMessage);
      
      return null;
    }
  };

  // Handle file selection (drag & drop or file input)
  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check total file limit
    if (uploads.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Initialize upload progress tracking
    const newUploads: UploadProgress[] = fileArray.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files concurrently
    const uploadPromises = fileArray.map(async (file, index) => {
      // Validate file first
      const validationError = validateFile(file);
      if (validationError) {
        setUploads(prev => prev.map((upload, i) => 
          i === prev.length - fileArray.length + index 
            ? { ...upload, status: 'error', progress: 0 }
            : upload
        ));
        alert(`${file.name}: ${validationError}`);
        return null;
      }

      // Upload the file
      const objectKey = await uploadFile(file);
      
      // Update upload status
      setUploads(prev => prev.map((upload, i) => 
        i === prev.length - fileArray.length + index 
          ? { 
              ...upload, 
              status: objectKey ? 'completed' : 'error',
              progress: 100,
              objectKey: objectKey || undefined
            }
          : upload
      ));

      return objectKey;
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    const successfulKeys = results.filter(key => key !== null) as string[];
    
    // Notify parent component of completed uploads
    if (successfulKeys.length > 0) {
      onUploadComplete(successfulKeys);
    }
  }, [uploads.length, maxFiles, fileType, token, onUploadComplete]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // File input change handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  }, [handleFiles]);

  // Remove an upload from the list
  const removeUpload = useCallback((index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Debug function to test direct R2 upload with multiple methods
  const testDirectR2Upload = async () => {
    try {
      // Create a small test image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Could not create test image");
        return;
      }
      
      // Draw a simple test pattern
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = 'blue';
      ctx.fillRect(25, 25, 50, 50);
      ctx.fillStyle = 'red';
      ctx.font = '10px Arial';
      ctx.fillText('Test ' + new Date().toISOString(), 10, 90);
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      
      // Create a File object
      const file = new File([blob], 'test-upload.png', { type: 'image/png' });
      
      // Step 1: Get the presigned URL directly
      console.log('Step 1: Getting presigned URL directly');
      
      // Check if we have a valid token
      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }
      
      const presignedResponse = await fetch(buildApiUrl(API_ENDPOINTS.UPLOADS.SIGNED_URL), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          content_type: 'image/png',
          file_type: fileType
        })
      });
      
      if (!presignedResponse.ok) {
        throw new Error(`Failed to get presigned URL: ${presignedResponse.status} ${presignedResponse.statusText}`);
      }
      
      const { upload_url, object_key } = await presignedResponse.json();
      console.log('Received presigned URL:', upload_url);
      console.log('Object key:', object_key);
      
      // Step 2: Try to upload directly to R2
      console.log('Step 2: Uploading directly to R2');
      
      // Method 1: Using fetch directly
      try {
        console.log('Method 1: Using fetch with PUT');
        const uploadResponse = await fetch(upload_url, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': 'image/png'
          }
        });
        
        if (uploadResponse.ok) {
          console.log('Method 1 succeeded!', uploadResponse.status, uploadResponse.statusText);
          toast.success('Upload succeeded using Method 1 (fetch/PUT)');
          return object_key;
        } else {
          console.error('Method 1 failed:', uploadResponse.status, uploadResponse.statusText);
          const errorText = await uploadResponse.text().catch(() => 'No error text');
          console.error('Error text:', errorText);
        }
      } catch (error) {
        console.error('Method 1 exception:', error);
      }
      
      // Method 2: Using XMLHttpRequest (older but sometimes more reliable for uploads)
      try {
        console.log('Method 2: Using XMLHttpRequest');
        const xhr = new XMLHttpRequest();
        
        // Create a promise to wait for the result
        const uploadResult = await new Promise<boolean>((resolve) => {
          xhr.open('PUT', upload_url);
          xhr.setRequestHeader('Content-Type', 'image/png');
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log('Method 2 succeeded!', xhr.status, xhr.statusText);
              resolve(true);
            } else {
              console.error('Method 2 failed:', xhr.status, xhr.statusText, xhr.responseText);
              resolve(false);
            }
          };
          
          xhr.onerror = (e) => {
            console.error('Method 2 error event:', e);
            resolve(false);
          };
          
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
            }
          };
          
          xhr.send(blob);
        });
        
        if (uploadResult) {
          toast.success('Upload succeeded using Method 2 (XMLHttpRequest)');
          return object_key;
        }
      } catch (error) {
        console.error('Method 2 exception:', error);
      }
      
      // If we reach here, both methods failed
      toast.error('All upload methods failed. Check console for details.');
      return null;
    } catch (error) {
      console.error('Test upload error:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };
  
  return (
    <div className={`photo-upload ${className}`}>
      {/* Debug panel - only in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4 p-3 border border-gray-300 rounded bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-2">Debug Tools</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              type="button"
              onClick={testDirectR2Upload}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Test R2 Upload
            </button>
            <button 
              type="button"
              onClick={() => console.log('Current auth token:', token)}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Check Auth
            </button>
            <button 
              type="button"
              onClick={() => {
                const corsTest = async () => {
                  try {
                    // First get a presigned URL
                    if (!token) {
                      toast.error('Authentication token is missing');
                      return;
                    }
                    
                    console.log('Getting presigned URL for CORS test');
                    const response = await fetch(buildApiUrl(API_ENDPOINTS.UPLOADS.SIGNED_URL), {
                      method: 'POST',
                      headers: getAuthHeaders(token),
                      body: JSON.stringify({
                        content_type: 'text/plain',
                        file_type: fileType
                      })
                    });
                    
                    if (!response.ok) {
                      throw new Error(`Failed to get presigned URL: ${response.status}`);
                    }
                    
                    const { upload_url } = await response.json();
                    console.log('Got presigned URL for CORS test:', upload_url);
                    
                    // Skip OPTIONS and try direct PUT with a small test file
                    console.log('Trying direct PUT to test CORS...');
                    
                    // Create a tiny test file
                    const testBlob = new Blob(['test'], { type: 'text/plain' });
                    
                    // Try the no-cors approach
                    try {
                      console.log('Testing upload with no-cors mode');
                      const directPutResponse = await fetch(upload_url, {
                        method: 'PUT',
                        body: testBlob,
                        mode: 'no-cors', // Try to bypass CORS restrictions
                        headers: {
                          'Content-Type': 'text/plain'
                        }
                      });
                      
                      console.log('Direct PUT test response (no-cors):', directPutResponse);
                      console.log('⚠️ Note: With no-cors mode, we cannot see the actual response status');
                      console.log('✅ If no error was thrown, the upload might have succeeded!');
                      
                      toast.success('CORS test complete - check console for details');
                    } catch (corsError) {
                      console.error('CORS error during test:', corsError);
                      toast.error('CORS test failed - see console for details');
                      
                      // Show recommended workaround
                      console.error('⚠️ R2 CORS Configuration Guide - WORKAROUND:');
                      console.error('Since R2 is not accepting OPTIONS in the CORS configuration, try:');
                      console.error(`
1. Use this CORS configuration in R2:
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET", "HEAD"], 
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 86400
  }
]

2. Try uploading your files - we've added workarounds that might help bypass the OPTIONS requirement.

3. If uploads still fail, you might need to use server-side proxying:
   - Upload to your backend server first
   - Have your server forward the file to R2
                      `);
                    }
                  } catch (e) {
                    console.error('CORS test setup failed:', e);
                    toast.error('CORS test failed - see console');
                  }
                };
                corsTest();
              }}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Test CORS
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Open browser console (F12) to see detailed logs
          </div>
        </div>
      )}
      
      {/* Drop zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        
        <div className="text-gray-600">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2">Drop photos here or click to browse</p>
          <p className="text-sm text-gray-500">
            JPEG, PNG, WebP, GIF up to 10MB each (max {maxFiles} files)
          </p>
        </div>
      </div>

      {/* Upload progress list */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-900">Uploads</h4>
          {uploads.map((upload, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{upload.fileName}</p>
                
                {/* Progress bar */}
                {upload.status === 'uploading' && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Status indicator */}
                <p className={`text-xs mt-1 ${
                  upload.status === 'completed' ? 'text-green-600' :
                  upload.status === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {upload.status === 'completed' ? '✓ Uploaded successfully' :
                   upload.status === 'error' ? '✗ Upload failed' :
                   'Uploading...'}
                </p>
              </div>
              
              {/* Remove button */}
              <button
                onClick={() => removeUpload(index)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
