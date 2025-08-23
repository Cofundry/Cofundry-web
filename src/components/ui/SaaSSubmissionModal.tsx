"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Badge } from "./badge";
import { Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { SaaSSubmission } from "@/lib/models/SaaS";

interface SaaSSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SaaSSubmission) => void;
}

export default function SaaSSubmissionModal({ isOpen, onClose, onSubmit }: SaaSSubmissionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    logo: '',
    logoFile: null as File | null,
    features: [''],
    category: '',
    tags: ['']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setFormData(prev => ({ ...prev, logoFile: file, logo: '' }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.url || (!formData.logo && !formData.logoFile) || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.url && !formData.url.startsWith('http')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsSubmitting(true);
    try {
      let logoUrl = formData.logo;
      
      // If logo file is selected, upload it first
      if (formData.logoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('logo', formData.logoFile);
        
        const uploadResponse = await fetch('/api/upload/logo', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload logo');
        }
        
        const uploadData = await uploadResponse.json();
        logoUrl = uploadData.url;
      }

      const submissionData: SaaSSubmission = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        logo: logoUrl,
        features: formData.features.filter(f => f.trim() !== ''),
        category: formData.category.trim(),
        tags: formData.tags.filter(t => t.trim() !== '')
      };

      await onSubmit(submissionData);
      toast.success('SaaS submitted successfully!');
      handleClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit SaaS. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      url: '',
      logo: '',
      logoFile: null,
      features: [''],
      category: '',
      tags: ['']
    });
    setLogoPreview('');
    onClose();
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    if (formData.tags.length > 1) {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((t, i) => i === index ? value : t)
    }));
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Submit Your SaaS</DialogTitle>
          <DialogDescription>
            Share your amazing SaaS product with the community. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">SaaS Name *</Label>
              <Input
                id="name"
                placeholder="Enter your SaaS name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Productivity, Development, Marketing"
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what your SaaS does and its key benefits"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://your-saas.com"
                value={formData.url}
                onChange={(e) => updateField('url', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo *</Label>
              <div className="space-y-2">
                {/* Logo preview */}
                {(logoPreview || formData.logo) && (
                  <div className="flex items-center space-x-2">
                    <img 
                      src={logoPreview || formData.logo} 
                      alt="Logo preview" 
                      className="w-12 h-12 rounded object-cover border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, logoFile: null, logo: '' }));
                        setLogoPreview('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {/* File upload */}
                <div className="space-y-2">
                  <Label htmlFor="logoFile" className="text-sm text-muted-foreground">
                    Upload logo file (PNG, JPG, SVG - max 5MB)
                  </Label>
                  <Input
                    id="logoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="cursor-pointer"
                  />
                </div>
                
                {/* Or URL input */}
                <div className="space-y-2">
                  <Label htmlFor="logoUrl" className="text-sm text-muted-foreground">
                    Or provide logo URL
                  </Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://your-saas.com/logo.png"
                    value={formData.logo}
                    onChange={(e) => {
                      updateField('logo', e.target.value);
                      if (formData.logoFile) {
                        setFormData(prev => ({ ...prev, logoFile: null }));
                        setLogoPreview('');
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              <Button
                type="button"
                onClick={addFeature}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Feature</span>
              </Button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeFeature(index)}
                      variant="outline"
                      size="sm"
                      className="px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tags</Label>
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </Button>
            </div>
            <div className="space-y-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Tag ${index + 1}`}
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                  />
                  {formData.tags.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeTag(index)}
                      variant="outline"
                      size="sm"
                      className="px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit SaaS</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
