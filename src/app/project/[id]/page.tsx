'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleMapWrapper } from '@/components/map/GoogleMapWrapper';
import { Project, getProject } from '@/lib/firebase/firestore';
import { ArrowLeft, Edit, Download, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && id) {
      loadProject();
    }
  }, [user, id]);

  const loadProject = async () => {
    if (!id || typeof id !== 'string') return;
    
    setLoading(true);
    const { project: projectData, error } = await getProject(id);
    
    if (error) {
      setError(error);
    } else {
      setProject(projectData);
    }
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertDescription>Project not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {project.location}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => router.push(`/project/${id}?mode=edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Info & Analysis */}
          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(project.createdAt.toDate(), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated:</span>
                  <span className="text-sm">
                    {format(project.updatedAt.toDate(), 'MMM d, yyyy')}
                  </span>
                </div>
                {project.geometry && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Parcel Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {project.geometry.type}
                    </Badge>
                  </div>
                )}
                {project.description && (
                  <div>
                    <p className="text-sm font-medium mb-2">Description:</p>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sustainability Score */}
            {project.analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Sustainability Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getScoreColor(project.analysis.compositeScore)}`}>
                      {Math.round(project.analysis.compositeScore)}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {getScoreLabel(project.analysis.compositeScore)}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Runoff & Slope</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${project.analysis.runoffScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round(project.analysis.runoffScore)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Noise Exposure</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all"
                            style={{ width: `${project.analysis.noiseScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round(project.analysis.noiseScore)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Climate Trends</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${project.analysis.climateScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round(project.analysis.climateScore)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Walkability</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 transition-all"
                            style={{ width: `${project.analysis.walkabilityScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round(project.analysis.walkabilityScore)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Start Analysis Button */}
            {!project.analysis && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      No environmental analysis has been performed yet.
                    </p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Start Environmental Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Parcel Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <GoogleMapWrapper 
                  initialGeometry={project.geometry}
                  center={project.geometry ? {
                    lat: project.geometry.coordinates[0]?.[1] || 40.7128,
                    lng: project.geometry.coordinates[0]?.[0] || -74.0060
                  } : undefined}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}