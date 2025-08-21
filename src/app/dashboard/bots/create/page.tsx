"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Globe,
  FileText,
  Brain,
  Zap,
  Sparkles,
  MessageSquare,
  Send,
  User,
  Loader2,
  CheckCircle,
  Database,
  Wand2,
  Eye,
  EyeOff,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sun, Moon } from "lucide-react"
import { useRouter } from "next/navigation"

interface Step {
  id: number
  title: string
  description: string
  icon: React.ReactNode
}

interface BotConfig {
  name: string
  description: string
  baseModel: string
  instructions: string
  image: File | null // Changed from string to File for image upload
  datasetType: "files" | "text" | "web" | null
  datasetContent: string
  files: File[]
  webUrl: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const steps: Step[] = [
  {
    id: 1,
    title: "Bot Identity",
    description: "Give your AI bot a name and personality",
    icon: <Bot className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "Model & Instructions",
    description: "Choose the AI model and define behavior",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "Training Data",
    description: "Add knowledge through various sources",
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: 4,
    title: "Training",
    description: "AI is learning from your data",
    icon: <Wand2 className="w-5 h-5" />,
  },
  {
    id: 5,
    title: "Test Your Bot",
    description: "Chat with your newly created AI",
    icon: <MessageSquare className="w-5 h-5" />,
  },
]

const agentPresets = [
  {
    id: "general",
    name: "General Assistant",
    description: "Helpful AI for everyday tasks",
    instructions: `You are a helpful AI assistant. Be friendly, accurate, and concise in your responses. Always aim to provide valuable assistance to users.`,
    icon: "🤖",
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "Specialized in customer service",
    instructions: `You are a customer support specialist. Be empathetic, patient, and solution-focused. Always prioritize customer satisfaction and provide clear, helpful responses.`,
    icon: "🎧",
  },
  {
    id: "teacher",
    name: "Educational Tutor",
    description: "Teaching and learning assistant",
    instructions: `You are an educational tutor. Break down complex concepts into simple explanations, provide examples, and encourage learning through positive reinforcement.`,
    icon: "📚",
  },
  {
    id: "creative",
    name: "Creative Assistant",
    description: "For creative and artistic tasks",
    instructions: `You are a creative assistant. Help with brainstorming, writing, design ideas, and artistic projects. Be imaginative, inspiring, and think outside the box.`,
    icon: "🎨",
  },
]

const trainingSteps = [
  "Initializing training environment...",
  "Processing your data...",
  "Training neural networks...",
  "Optimizing model parameters...",
  "Validating performance...",
  "Finalizing your AI bot...",
]

export default function BotCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: "",
    description: "",
    baseModel: "gpt-4o-mini",
    instructions: "",
    datasetType: null,
    datasetContent: "",
    image: null,
    files: [],
    webUrl: "",
  })
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [currentTrainingStep, setCurrentTrainingStep] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [selectedPreset, setSelectedPreset] = useState("general")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [createdBot, setCreatedBot] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [credentialModels, setCredentialModels] = useState<string[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");

  const currentPreset = agentPresets.find((preset) => preset.id === selectedPreset) || agentPresets[0]

  useEffect(() => {
    setBotConfig((prev) => ({
      ...prev,
      instructions: currentPreset.instructions,
    }))
  }, [selectedPreset, currentPreset.instructions])

  useEffect(() => {
    if (createdBot) {
      const timer = setTimeout(() => {
        router.push("/dashboard/bots");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [createdBot, router]);

  useEffect(() => {
    async function fetchCredentials() {
      const res = await fetch("/api/dashboard/credentials");
      if (res.ok) {
        const data = await res.json();
        setCredentials(data.credentials || []);
        // Extract unique models and keep their ObjectId
        setCredentialModels(
          Array.from(new Set((data.credentials || []).map((c: any) => c.model).filter(Boolean)))
        );
      }
    }
    fetchCredentials();
  }, []);

  // When credentials are loaded, set default selectedModelId if only one is available
  useEffect(() => {
    if (credentials.length === 1) {
      setSelectedModelId(credentials[0]._id);
      setBotConfig((prev) => ({ ...prev, baseModel: credentials[0].model }));
    }
  }, [credentials]);

  // When selectedModelId changes, update botConfig.baseModel
  useEffect(() => {
    const selected = credentials.find((c) => c._id === selectedModelId);
    if (selected) {
      setBotConfig((prev) => ({ ...prev, baseModel: selected.model }));
    }
  }, [selectedModelId, credentials]);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return botConfig.name.trim() !== ""
      case 2:
        return botConfig.baseModel && botConfig.instructions.trim() !== ""
      case 3:
        return (
          botConfig.datasetType &&
          ((botConfig.datasetType === "text" && botConfig.datasetContent.trim() !== "") ||
            (botConfig.datasetType === "files" && botConfig.files.length > 0) ||
            (botConfig.datasetType === "web" && botConfig.webUrl.trim() !== ""))
        )
      default:
        return true
    }
  }

  const startTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    setCurrentTrainingStep(0);
    setError(null);
    try {
      // Build FormData for dataset
      const formData = new FormData();
      formData.append("id", crypto.randomUUID());
      formData.append("name", botConfig.name);
      formData.append("description", botConfig.description);
      formData.append("type", botConfig.datasetType || "text");
      formData.append("collection", botConfig.name.replace(/\s+/g, '_').toLowerCase());
      formData.append("vectorDb", "chroma");
      formData.append("modelId", selectedModelId); // Use selected credential ObjectId
      formData.append("instruction", botConfig.instructions);
      formData.append("status", "ready");
      formData.append("image", botConfig.image || "");
      formData.append("createdAt", new Date().toISOString());
      if (botConfig.datasetType === "files" && botConfig.files.length > 0) {
        formData.append("file", botConfig.files[0]);
      } else if (botConfig.datasetType === "text") {
        // Send the training text as a file (Blob), like the collection logic
        formData.append("file", new Blob([botConfig.datasetContent || "No data"], { type: "text/plain" }), "data.txt");
      } else if (botConfig.datasetType === "web") {
        formData.append("sourceUrl", botConfig.webUrl);
      }
      // POST to API to create dataset and bot
      const res = await fetch("/api/dashboard/bots", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setIsTraining(false);
        setError("Failed to create bot. Please try again.");
        return;
      }
      const data = await res.json();
      setCreatedBot(data.bot);
      setIsTraining(false);
      setCurrentStep(5);
    } catch (e) {
      setIsTraining(false);
      setError("An error occurred. Please try again.");
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `As ${botConfig.name}, I'd be happy to help you with that! Based on my training, here's what I think...`,
        `Great question! Let me provide you with a helpful response based on my knowledge.`,
        `I understand what you're asking. Here's my take on that topic...`,
        `That's interesting! Based on my training data, I can share some insights about this.`,
      ]

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1500)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setBotConfig((prev) => ({
        ...prev,
        files: Array.from(files),
      }))
    }
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setBotConfig({
      name: "",
      description: "",
      baseModel: "gpt-4o-mini",
      instructions: "",
      image: null,
      datasetType: null,
      datasetContent: "",
      files: [],
      webUrl: "",
    })
    setMessages([])
    setTrainingProgress(0)
    setIsTraining(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
    
  
      {/* Progress Steps */}
      <div className="max-w-6xl mx-auto px-6 py-8"> 
         <div className="flex items-center  gap-3 mb-10 pb-10 px-10">
            <div className="p-2 bg-primary rounded-xl">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground"> Training</h1>
              <p className="text-muted-foreground">Manage your AI model Training and Performance</p>

            </div>
          </div>
        <div className="flex items-center justify-between mb-8 px-10">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep > step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.icon}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-24">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {isTraining && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
              <div className="flex flex-col items-center gap-2 p-6 bg-white rounded-lg shadow max-w-xs w-full">
                <Loader2 className="w-8 h-8 animate-spin " />
                <div className="text-base font-semibold ">Loading...</div>
              </div>
            </div>
          )}
          {currentStep === 1 && (
            <Card className="">
              <CardHeader className="text-center pb-6">
            
                <CardTitle className="text-2xl">Let's Create Your AI Bot</CardTitle>
                <p className="text-muted-foreground">Give your AI assistant a unique identity and personality</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold">Bot Name *</Label>
                    <Input
                      placeholder="e.g., Alex Assistant, Helper Bot, etc."
                      value={botConfig.name}
                      onChange={(e) => setBotConfig((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-2 h-12 text-lg"
                    />
                  </div>
                  <div>
                     <Label className="text-base font-semibold">Bot Image (Optional)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBotConfig((prev) => ({ ...prev, image: file }));
                        }
                      }}
                      className="mt-2 h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Description (Optional)</Label>
                    <Input
                      placeholder="Brief description of your bot's purpose"
                      value={botConfig.description}
                      onChange={(e) => setBotConfig((prev) => ({ ...prev, description: e.target.value }))}
                      className="mt-2 h-12"
                    />
                  </div>
                </div>
                {botConfig.name && (
                  <div className="p-4 bg-muted rounded-lg border">
                    <p className="text-foreground">
                      <strong>Preview:</strong> Hi! I'm {botConfig.name}.{" "}
                      {botConfig.description || "I'm here to help you with whatever you need!"}
                    </p>
                  </div>
                )}
              </CardContent>















            </Card>
          )}

          {/* Step 2: Model & Instructions */}
          {currentStep === 2 && (
            <Card className="">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Configure AI Model</CardTitle>
                <p className="text-muted-foreground">Choose the AI model and define how your bot should behave</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Base AI Model</Label>
                  <Select
                    value={selectedModelId}
                    onValueChange={setSelectedModelId}
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue defaultValue={'gpt-4o'} placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {credentials.length === 0 ? (
                        <SelectItem value="gpt-4o" disabled>
                          No models available
                        </SelectItem>
                      ) : (
                        credentials.map((cred) => (
                          <SelectItem key={cred._id} value={cred._id}>
                            {cred.model} ({cred.provider})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Bot Personality</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {agentPresets.map((preset) => (
                      <Card
                        key={preset.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedPreset === preset.id ? "border-primary bg-accent" : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPreset(preset.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{preset.icon}</span>
                            <div>
                              <h3 className="font-semibold">{preset.name}</h3>
                              <p className="text-sm text-muted-foreground">{preset.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Custom Instructions</Label>
                  <Textarea
                    placeholder="Customize how your bot should behave..."
                    value={botConfig.instructions}
                    onChange={(e) => setBotConfig((prev) => ({ ...prev, instructions: e.target.value }))}
                    className="mt-2 min-h-32 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Training Data */}
          {currentStep === 3 && (
            <Card className="">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Add Training Data</CardTitle>
                <p className="text-muted-foreground">Provide knowledge for your AI bot to learn from</p>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={botConfig.datasetType || "text"}
                  onValueChange={(value) => setBotConfig((prev) => ({ ...prev, datasetType: value as any }))}
                >
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="text" className="flex items-center gap-2" onClick={() => setBotConfig((prev) => ({ ...prev, datasetType: "text" }))}>
                      <FileText className="w-4 h-4" />
                      Text Input
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex items-center gap-2" onClick={() => setBotConfig((prev) => ({ ...prev, datasetType: "files" }))}>
                      <Upload className="w-4 h-4" />
                      Upload Files
                    </TabsTrigger>
                    <TabsTrigger value="web" className="flex items-center gap-2" onClick={() => setBotConfig((prev) => ({ ...prev, datasetType: "web" }))}>
                      <Globe className="w-4 h-4" />
                      Web Scraping
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text">
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Training Text</Label>
                      <Textarea
                        placeholder="Enter the knowledge you want your bot to learn from..."
                        value={botConfig.datasetContent}
                        onChange={(e) => setBotConfig((prev) => ({ ...prev, datasetContent: e.target.value, datasetType: "text" }))}
                        className="min-h-40 resize-none"
                      />
                      <p className="text-sm text-muted-foreground">
                        Add any text content like FAQs, documentation, or knowledge base articles.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="files">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Upload Training Files</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Supports .txt, .pdf, .docx, .json, .csv files up to 10MB each
                        </p>
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".txt,.pdf,.docx,.json,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                      {botConfig.files.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">Selected Files:</Label>
                          {botConfig.files.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{file.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {(file.size / 1024).toFixed(1)} KB
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="web">
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Website URL</Label>
                      <Input
                        placeholder="https://example.com"
                        value={botConfig.webUrl}
                        onChange={(e) => setBotConfig((prev) => ({ ...prev, webUrl: e.target.value }))}
                        className="h-12"
                      />
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Only publicly accessible content will be scraped</p>
                        <p>• Respects robots.txt and rate limits</p>
                        <p>• Text content only, no images or media</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Training */}
          {currentStep === 4 && (
            <Card className="">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  {isTraining ? (
                    <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                  ) : (
                    <Wand2 className="w-8 h-8 text-primary-foreground" />
                  )}
                </div>
                <CardTitle className="text-2xl">{isTraining ? "Training Your AI Bot" : "Ready to Train"}</CardTitle>
                <p className="text-muted-foreground">
                  {isTraining
                    ? "Please wait while we train your AI with the provided data"
                    : "Click the button below to start training your AI bot"}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isTraining && trainingProgress === 0 && (
                  <div className="text-center">
                    <div className="bg-muted rounded-lg p-6 mb-6">
                      <h3 className="font-semibold mb-4">Training Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Bot Name:</strong> {botConfig.name}
                        </div>
                        <div>
                          <strong>Base Model:</strong> {botConfig.baseModel}
                        </div>
                        <div>
                          <strong>Data Source:</strong>{" "}
                          {botConfig.datasetType === "text"
                            ? "Text Input"
                            : botConfig.datasetType === "files"
                              ? `${botConfig.files.length} Files`
                              : "Web Scraping"}
                        </div>
                        <div>
                          <strong>Personality:</strong> {currentPreset.name}
                        </div>
                      </div>
                    </div>
                    <Button onClick={startTraining} size="lg" className="bg-primary hover:bg-primary/90" disabled={isTraining}>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Start Training
                    </Button>
                  </div>
                )}
                {isTraining && (
                  <div className="space-y-6">
                    <div className="mt-4 flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                      <p className="text-primary font-medium">Training started. This may take a few moments. Please wait...</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">{Math.round(trainingProgress)}%</div>
                      <Progress value={trainingProgress} className="w-full h-3" />
                    </div>
                    <div className="space-y-3">
                      {trainingSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                            index < currentTrainingStep
                              ? "bg-accent text-accent-foreground"
                              : index === currentTrainingStep
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index < currentTrainingStep ? (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          ) : index === currentTrainingStep ? (
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                          )}
                          <span className="font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                    {trainingProgress === 100 && (
                      <div className="text-center p-6 bg-accent rounded-lg border">
                        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-accent-foreground mb-2">Training Complete!</h3>
                        <p className="text-muted-foreground">Your AI bot "{botConfig.name}" is ready to chat!</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Test Bot (now static preview) */}
          {currentStep === 5 && createdBot && (
            <>
              <div className="mb-6">
                <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg px-4 py-3 text-center font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Model created successfully! Redirecting to dashboard...
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bot Info */}
                <Card className="">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle>{createdBot.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{createdBot.description || "AI Assistant"}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model ID:</span>
                        <Badge variant="secondary">{createdBot.modelId}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Collection Name:</span>
                        <span>{createdBot.collection_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vector DB:</span>
                        <span>{createdBot.vectorDb}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{createdBot.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created At:</span>
                        <span>{new Date(createdBot.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Badge className="bg-accent text-accent-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active & Ready
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                {/* Static Instructions Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-muted-foreground">{createdBot.instruction}</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Error display */}
          {error && (
            <div className="text-center text-red-500 font-medium mt-4">{error}</div>
          )}

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button onClick={currentStep === 3 ? startTraining : nextStep} disabled={!canProceed()}>
                {currentStep === 3 ? "Start Training" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}