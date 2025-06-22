
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      toast({
        title: "Camera Not Supported",
        description: "Camera access is not supported on this device or browser.",
        variant: "destructive",
      });
    }

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    if (!isSupported) {
      toast({
        title: "Camera Not Available",
        description: "Camera access is not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting camera...');
      
      // Request camera permissions with fallback options
      const constraints = {
        video: { 
          facingMode: 'environment', // Use back camera by default
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: false
      };

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // Fallback to any available camera
        console.log('Back camera not available, trying any camera...');
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          },
          audio: false
        });
      }
      
      console.log('Camera stream obtained');
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video is ready before playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
        console.log('Video element setup complete');
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = "Please allow camera access and ensure you're on HTTPS or localhost.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Camera access was denied. Please allow camera permissions and try again.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No camera found on this device.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Camera is not supported on this device or browser.";
        }
      }
      
      toast({
        title: "Camera Access Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    console.log('Capturing photo...');
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
        console.log('Photo captured successfully');
      } else {
        console.error('Video not ready or canvas context not available');
        toast({
          title: "Capture Error",
          description: "Video not ready. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const retakePhoto = () => {
    console.log('Retaking photo...');
    setCapturedImage(null);
    startCamera();
  };

  const confirmCapture = () => {
    console.log('Confirming capture...');
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `policy_${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          console.log('File created:', file.name, file.size);
          onCapture(file);
          handleClose();
        } else {
          console.error('Failed to create blob from canvas');
          toast({
            title: "Save Error",
            description: "Failed to save the captured image.",
            variant: "destructive",
          });
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleClose = () => {
    console.log('Closing camera capture...');
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Scan Document</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!isSupported && (
            <div className="text-center space-y-4">
              <Camera className="w-16 h-16 text-gray-400 mx-auto" />
              <p className="text-gray-600">Camera is not supported on this device or browser</p>
              <p className="text-xs text-gray-500">Please try uploading a file instead</p>
              <Button
                onClick={handleClose}
                className="w-full bg-[#183B6B] hover:bg-[#1a3d6f] text-white"
              >
                Close
              </Button>
            </div>
          )}

          {isSupported && !isCapturing && !capturedImage && (
            <div className="text-center space-y-4">
              <Camera className="w-16 h-16 text-gray-400 mx-auto" />
              <p className="text-gray-600">Position your insurance document in good lighting</p>
              <p className="text-xs text-gray-500">Make sure to allow camera permissions when prompted</p>
              <Button
                onClick={startCamera}
                className="w-full bg-[#183B6B] hover:bg-[#1a3d6f] text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            </div>
          )}

          {isCapturing && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-[#183B6B] hover:bg-[#1a3d6f] text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured document"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={retakePhoto}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={confirmCapture}
                  className="flex-1 bg-[#E2B319] hover:bg-[#d4a617] text-black font-semibold"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use Photo
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraCapture;
