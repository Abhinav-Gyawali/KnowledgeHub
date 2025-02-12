import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./button";

interface MediaUploadProps {
  onMediaChange: (urls: string[]) => void;
  defaultUrls?: string[];
}

export function MediaUpload({ onMediaChange, defaultUrls = [] }: MediaUploadProps) {
  const [mediaUrls, setMediaUrls] = useState<string[]>(defaultUrls);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        const url = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        newUrls.push(url);
      }
    }

    const updatedUrls = [...mediaUrls, ...newUrls];
    setMediaUrls(updatedUrls);
    onMediaChange(updatedUrls);
  };

  const removeMedia = (index: number) => {
    const updatedUrls = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(updatedUrls);
    onMediaChange(updatedUrls);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {mediaUrls.map((url, index) => (
          <div key={index} className="relative group">
            {url.includes('video') ? (
              <video
                src={url}
                className="h-24 w-24 object-cover rounded-md"
                controls
              />
            ) : (
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="h-24 w-24 object-cover rounded-md"
              />
            )}
            <button
              onClick={() => removeMedia(index)}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload images or videos
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
}
