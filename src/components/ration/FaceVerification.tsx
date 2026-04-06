import { useRef, useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";

interface FaceVerificationProps {
  onVerified: () => void;
}

const FaceVerification = ({ onVerified }: FaceVerificationProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      alert("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      stopCamera();
      setTimeout(onVerified, 1200);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Face Verification
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Look at the camera and click verify
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-64 h-64 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center relative">
            {verified && (
              <div className="absolute inset-0 bg-success/20 flex items-center justify-center z-10">
                <CheckCircle2 className="w-16 h-16 text-success" />
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${streaming ? "block" : "hidden"}`}
            />
            {!streaming && !verified && (
              <Camera className="w-12 h-12 text-muted-foreground" />
            )}
          </div>

          {!streaming && !verified && (
            <Button onClick={startCamera} className="w-full" size="lg">
              Start Camera
            </Button>
          )}
          {streaming && !verifying && !verified && (
            <Button onClick={handleVerify} className="w-full" size="lg">
              Verify Face
            </Button>
          )}
          {verifying && (
            <Button disabled className="w-full" size="lg">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </Button>
          )}
          {verified && (
            <p className="text-success font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Verification Successful
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceVerification;
