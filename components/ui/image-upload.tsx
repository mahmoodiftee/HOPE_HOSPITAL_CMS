"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import Image from "next/image";
import { deleteImage, getFileIdFromUrl, uploadImage } from "@/lib/appwrite-queries";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onClear: () => void;
}

export function ImageUpload({ value, onChange, onClear }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast.error("Invalid File", "Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast.error("File Too Large", "Image must be less than 5MB");
            return;
        }

        try {
            setUploading(true);

            if (value) {
                const oldFileId = getFileIdFromUrl(value);
                if (oldFileId) {
                    try {
                        await deleteImage(oldFileId);
                    } catch (error) {
                        console.error("Failed to delete old image:", error);
                    }
                }
            }

            const url = await uploadImage(file);
            onChange(url);
            showToast.success("Image Uploaded", "Your image has been uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            showToast.error("Upload Failed", "Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleClear = async () => {
        if (value) {
            const fileId = getFileIdFromUrl(value);
            if (fileId) {
                try {
                    await deleteImage(fileId);
                    showToast.success("Image Removed", "Image has been removed");
                } catch (error) {
                    console.error("Failed to delete image:", error);
                }
            }
        }
        onClear();
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />

            {value ? (
                <div className="relative group">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                        <Image
                            src={value}
                            alt="Uploaded preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleClear}
                            disabled={uploading}
                            className="opacity-90 hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClick}
                        disabled={uploading}
                        className="w-full mt-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Change Image
                            </>
                        )}
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClick}
                    disabled={uploading}
                    className="w-full h-48 border-2 border-dashed hover:border-primary/50"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="w-8 h-8" />
                            <span className="text-sm">Click to upload image</span>
                            <span className="text-xs">Max size: 5MB</span>
                        </div>
                    )}
                </Button>
            )}
        </div>
    );
}