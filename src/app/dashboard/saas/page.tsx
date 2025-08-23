"use client";

import { useState, useEffect } from "react";
import { SaaS } from "@/lib/models/SaaS";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SaaSCard from "@/components/ui/SaaSCard";
import SaaSSubmissionModal from "@/components/ui/SaaSSubmissionModal";
import { Plus, TrendingUp, Calendar, Star, Clock, CheckCircle, XCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";

export default function DashboardSaaSPage() {
  const [saasList, setSaasList] = useState<SaaS[]>([]);
  const [displayList, setDisplayList] = useState<SaaS[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSaas, setTotalSaas] = useState(0);

  const fetchSaaS = async (status: string = 'all', page: number = 1, sortBy: string = 'votes', limit: number = 12) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      // Only add status filter if not "all"
      if (status !== 'all') {
        params.append('status', status);
      }

  const response = await fetch(`/api/saas?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSaasList(data.saas || []);
        setTotalPages(data.pagination.totalPages);
        setTotalSaas(data.pagination.totalSaas);
      } else {
        toast.error('Failed to load SaaS products');
      }
    } catch (error) {
      console.error('Error fetching SaaS:', error);
      toast.error('Failed to load SaaS products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Choose server-side sort + limit depending on tab
  if (activeTab === 'trending') {
      // get top items by votes (limit small for top list)
      fetchSaaS('all', 1, 'votes', 50); // fetch 50 to safely pick top 5 client-side
    } else if (activeTab === 'today') {
      // fetch recent items sorted by votes; we'll filter to today's items client-side
      fetchSaaS('all', 1, 'votes', 50);
    } else {
      // all
      fetchSaaS('all', currentPage, 'votes', 12);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage]);

  // Derive the display list depending on activeTab and saasList
  useEffect(() => {
    if (!saasList) return;

    if (activeTab === 'trending') {
      // top 5 by votes globally
      const top = [...saasList].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 5);
      setDisplayList(top);
    } else if (activeTab === 'today') {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const filtered = saasList.filter(s => {
        const d = new Date(s.createdAt || s.createdAt);
        return d >= start && d < end;
      }).sort((a, b) => (b.votes || 0) - (a.votes || 0));
      setDisplayList(filtered);
    } else {
    // Ensure All is ranked by votes (highest first)
    const allSorted = [...saasList].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    setDisplayList(allSorted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saasList, activeTab]);

  const handleSubmitSaaS = async (data: any) => {
    try {
      const response = await fetch('/api/saas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('SaaS submitted successfully! It is live now.');
        // Refresh the current tab
        let sortBy = 'votes';
        if (activeTab === 'today') sortBy = 'todayVotes';
        fetchSaaS(activeTab === 'all' ? 'all' : activeTab, currentPage, sortBy);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit SaaS');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit SaaS');
      throw error;
    }
  };

  const handleVoteChange = (saasId: string, votes: number, todayVotes: number) => {
    setSaasList(prev => prev.map(saas => 
      saas._id === saasId 
        ? { ...saas, votes, todayVotes }
        : saas
    ));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // status badges removed — all submissions are shown immediately (auto-approved)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            SaaS Products
          </h1>
          <p className="text-muted-foreground">
            Discover, submit, and manage amazing SaaS tools
          </p>
        </div>
        <Button
          onClick={() => setIsSubmissionModalOpen(true)}
          size="lg"
          className="flex items-center space-x-2 mt-4 lg:mt-0"
        >
          <Plus className="w-5 h-5" />
          <span>Submit New SaaS</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>All SaaS</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trending</span>
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Today's Best</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))
            ) : displayList.length > 0 ? (
              displayList.map((saas) => (
                <div key={saas._id} className="relative">
                  <SaaSCard
                    saas={saas}
                    onVoteChange={(votes, todayVotes) => 
                      handleVoteChange(saas._id!, votes, todayVotes)
                    }
                    showVoteButton={true}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No SaaS products found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to submit a SaaS product!
                </p>
                <Button onClick={() => setIsSubmissionModalOpen(true)}>
                  Submit Your SaaS
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))
            ) : displayList.length > 0 ? (
              displayList.map((saas, idx) => (
                <div key={saas._id} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-primary">#{idx + 1}</div>
                    </div>
                    <div className="flex-1">
                      <SaaSCard
                        saas={saas}
                        onVoteChange={(votes, todayVotes) => 
                          handleVoteChange(saas._id!, votes, todayVotes)
                        }
                        showVoteButton={true}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No trending SaaS products
                </h3>
                <p className="text-muted-foreground mb-4">
                  Submit your SaaS to get started!
                </p>
                <Button onClick={() => setIsSubmissionModalOpen(true)}>
                  Submit Your SaaS
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))
            ) : displayList.length > 0 ? (
              displayList.map((saas) => (
                <div key={saas._id} className="relative">
                  <SaaSCard
                    saas={saas}
                    onVoteChange={(votes, todayVotes) => 
                      handleVoteChange(saas._id!, votes, todayVotes)
                    }
                    showVoteButton={true}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No trending SaaS today
                </h3>
                <p className="text-muted-foreground mb-4">
                  Check back later or submit your SaaS to get started!
                </p>
                <Button onClick={() => setIsSubmissionModalOpen(true)}>
                  Submit Your SaaS
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

  {/* 'Newest' tab removed per request */}

  {/* Pending tab removed - all submissions are auto-approved */}
      </Tabs>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <SaaSSubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSubmit={handleSubmitSaaS}
      />
    </div>
  );
}
