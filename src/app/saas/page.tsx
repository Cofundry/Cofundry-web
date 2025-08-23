"use client";

import { useState, useEffect } from "react";
import { SaaS } from "@/lib/models/SaaS";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SaaSCard from "@/components/ui/SaaSCard";
import { Plus, TrendingUp, Calendar, Star, Building2, ArrowRight, Zap, Users, Globe, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";
import { useRouter } from "next/navigation";
import { Navbar1 } from "@/components/ui/landingpage/navbar";
import { Footer7 } from "@/components/ui/landingpage/footer";

export default function SaaSPage() {
  const [saasList, setSaasList] = useState<SaaS[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSaas, setTotalSaas] = useState(0);
  const router = useRouter();

  const fetchSaaS = async (sortBy: string = 'votes', page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        page: page.toString(),
        limit: '12',
        status: 'approved'
      });

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
    let sortBy = 'votes';
    if (activeTab === 'today') sortBy = 'todayVotes';

    fetchSaaS(sortBy, currentPage);
  }, [activeTab, currentPage]);

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

  const handleSubmitSaaS = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar1 />

      {/* Hero Section */}
      

      {/* Featured SaaS Products Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Featured SaaS Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the most popular and trending SaaS tools that developers love
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Ranked by votes</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Trending today</span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg" />
                  ))
                ) : saasList.length > 0 ? (
                  saasList.map((saas, index) => (
                    <div key={saas._id} className="relative">
                      {/* Ranking badge */}
                      {index < 3 && (
                        <div className="absolute -top-2 -left-2 z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      )}
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
                  <div className="col-span-full text-center py-16">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No trending SaaS products yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Be the first to submit a SaaS product and get it trending!
                    </p>
                    <Button onClick={handleSubmitSaaS} className="px-6 py-2">
                      Submit Your SaaS
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="today" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-lg" />
                  ))
                ) : saasList.length > 0 ? (
                  saasList.map((saas, index) => (
                    <div key={saas._id} className="relative">
                      {/* Today's ranking badge */}
                      {index < 3 && (
                        <div className="absolute -top-2 -left-2 z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-orange-500' : 
                            index === 1 ? 'bg-red-400' : 'bg-pink-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      )}
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
                  <div className="col-span-full text-center py-16">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No trending SaaS today
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Check back later or submit your SaaS to get started!
                    </p>
                    <Button onClick={handleSubmitSaaS} className="px-6 py-2">
                      Submit Your SaaS
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer7 />
    </div>
  );
}
