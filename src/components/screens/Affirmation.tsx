import React, { FC, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const Affirmation: FC<{ onCompletedCamera: () => void }> = ({ onCompletedCamera }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            mediaStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // play may return a promise; ignore errors from autoplay policies
                videoRef.current.play().catch(() => { });
            }
            setIsCameraOn(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const onCameraFinished = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            mediaStreamRef.current = null; // Clear the reference
            setIsCameraOn(false);
        }
        const video = videoRef.current;
        if (video && video.srcObject) {
            const tracks = (video.srcObject as MediaStream).getTracks();
            tracks.forEach((t) => t.stop());
            video.srcObject = null;
        }
        onCompletedCamera();
    }
    const stopCamera = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            mediaStreamRef.current = null; // Clear the reference
            setIsCameraOn(false);
        }
    };
    useEffect(() => {
        // cleanup: stop camera when unmounting
        return () => {
            const video = videoRef.current;
            if (video && video.srcObject) {
                const tracks = (video.srcObject as MediaStream).getTracks();
                tracks.forEach((t) => t.stop());
                video.srcObject = null;
            }
        };
        // empty deps to run once on mount/unmount
    }, []);

    return (
        <Card className="shadow-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Video Recording
                </CardTitle>
                <video ref={videoRef}></video>
                <p className="text-sm text-muted-foreground">
                    Record technique videos or motivational messages
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    
                    <Button
                        variant="outline"
                        className="w-1/2 bg-gradient-sky hover:opacity-90 transition-all"
                        onClick={isCameraOn ? stopCamera : startCamera}
                    >
                        {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                    </Button>
                    <Button
                        onClick={onCameraFinished}
                        variant="default"
                        size="icon" className="w-1/2">
                        Complete
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
export default Affirmation;