'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleMapWrapper } from '@/components/map/GoogleMapWrapper';
import { createProject } from '@/lib/firebase/firestore';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function NewProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
  });
  const [geometry, setGeometry] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }

    setSaving(true);
    setError('');

    const { id, error: createError } = await createProject({
      userId: user.uid,
      name: formData.name.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
      geometry,
    });

    if (createError) {
      setError(createError);
      setSaving(false);
    } else {
      toast.success('Project created successfully');
      router.push(`/project/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">New Environmental Analysis</h1>
              <p className="text-muted-foreground">Create a new parcel evaluation project</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Project
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Enter location (city, state)"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional project description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Geometry Info */}
            {geometry && (
              <Card>
                <CardHeader>
                  <CardTitle>Parcel Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Shape Type:</span>
                      <span className="text-sm capitalize">{geometry.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Coordinates:</span>
                      <span className="text-sm">{geometry.coordinates.length} points</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Define Your Parcel</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Use the drawing tools to outline the area you want to analyze
                </p>
              </CardHeader>
              <CardContent>
                <GoogleMapWrapper onGeometryChange={setGeometry} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}