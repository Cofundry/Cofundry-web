"use client";

import { useState, useEffect } from "react";
import { SaaS } from "@/lib/models/SaaS";
import { Button } from "./button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import SaaSCard from "./SaaSCard";
import { TrendingUp, Calendar, Star, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SaaSSectionProps {
  title?: string;
  description?: string;
}

export default function SaaSSection({ 
  title = "Discover Amazing SaaS Products", 
  description = "Find and vote for the best SaaS tools that help you build, grow, and succeed" 
}: SaaSSectionProps) {
  const [saasList, setSaasList] = useState<SaaS[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trending");
  const router = useRouter();

  const fetchSaaS = async (sortBy: string = 'votes') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        limit: '6',
        status: 'approved'
      });

      const response = await fetch(`/api/saas?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSaasList(data.saas || []);
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
    fetchSaaS(activeTab === 'trending' ? 'votes' : activeTab === 'today' ? 'todayVotes' : 'createdAt');
  }, [activeTab]);

  const handleVoteChange = (saasId: string, votes: number, todayVotes: number) => {
    setSaasList(prev => prev.map(saas => 
      saas._id === saasId 
        ? { ...saas, votes, todayVotes }
        : saas
    ));
  };

  const handleViewAllSaaS = () => {
    router.push('/dashboard/saas');
  };

  const handleSubmitSaaS = () => {
    router.push('/dashboard/saas');
  };

  return (
    <section id="saas" className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="flex justify-center mb-8 gap-4">
          <Button
            onClick={handleViewAllSaaS}
            size="lg"
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Building2 className="w-5 h-5" />
            <span>View All SaaS</span>
          </Button>
          <Button
            onClick={handleSubmitSaaS}
            size="lg"
            className="flex items-center space-x-2"
          >
            <Building2 className="w-5 h-5" />
            <span>Submit Your SaaS</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="trending" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </TabsTrigger>
            <TabsTrigger value="today" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Today's Best</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
                ))
              ) : saasList.length > 0 ? (
                saasList.map((saas) => (
                  <SaaSCard
                    key={saas._id}
                    saas={saas}
                    onVoteChange={(votes, todayVotes) => 
                      handleVoteChange(saas._id!, votes, todayVotes)
                    }
                    showVoteButton={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No SaaS products found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to submit a SaaS product!
                  </p>
                  <Button onClick={handleSubmitSaaS}>
                    Submit Your SaaS
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="today" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
                ))
              ) : saasList.length > 0 ? (
                saasList.map((saas) => (
                  <SaaSCard
                    key={saas._id}
                    saas={saas}
                    onVoteChange={(votes, todayVotes) => 
                      handleVoteChange(saas._id!, votes, todayVotes)
                    }
                    showVoteButton={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No trending SaaS today
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Check back later or submit your SaaS to get started!
                  </p>
                  <Button onClick={handleSubmitSaaS}>
                    Submit Your SaaS
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 'Newest' tab removed */}
        </Tabs>

        {saasList.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={handleViewAllSaaS}>
              View All SaaS Products
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
