"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CircleIcon,
  NetworkIcon,
  BoxIcon,
  DatabaseIcon,
  Play,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface WalkthroughProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Walkthrough({ open, onOpenChange }: WalkthroughProps) {
  const [step, setStep] = useState(1);
  const [showAgain, setShowAgain] = useState(true);

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save preference if user doesn't want to see again
      if (!showAgain) {
        localStorage.setItem("hideWalkthrough", "true");
      }
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    // Save preference if user doesn't want to see again
    if (!showAgain) {
      localStorage.setItem("hideWalkthrough", "true");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to Neural Network Visualizer</DialogTitle>
          <DialogDescription>
            Let's walk through the key features to help you get started.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 relative">
          <div className="absolute top-0 left-0 w-full flex justify-center">
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full ${
                    i + 1 === step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4">
                  <img
                    src="https://miro.medium.com/max/3744/1*CnNorCR4Zdq7pVchdsRGyw.png"
                    alt="Neural Network Visualizer Overview"
                    className="rounded-md border"
                  />
                </div>
                <h3 className="text-lg font-medium">
                  Build Neural Networks Visually
                </h3>
                <p className="text-sm text-muted-foreground">
                  The Neural Network Visualizer allows you to create, visualize,
                  and train neural networks using an intuitive drag-and-drop
                  interface. You can experiment with different architectures,
                  activation functions, and see how data flows through your
                  network in real-time.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adding Layers</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop different layer types from the sidebar onto the
                  canvas to build your network.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-3">
                      <div className="flex items-center">
                        <CircleIcon className="h-4 w-4 mr-2 text-blue-500" />
                        <CardTitle className="text-sm">Input Layer</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription className="text-xs">
                        The entry point for data into your network
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <div className="flex items-center">
                        <NetworkIcon className="h-4 w-4 mr-2 text-purple-500" />
                        <CardTitle className="text-sm">Hidden Layer</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription className="text-xs">
                        Intermediate processing layers with adjustable neurons
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <div className="flex items-center">
                        <BoxIcon className="h-4 w-4 mr-2 text-green-500" />
                        <CardTitle className="text-sm">Output Layer</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription className="text-xs">
                        The final layer that produces predictions
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <div className="flex items-center">
                        <DatabaseIcon className="h-4 w-4 mr-2 text-orange-500" />
                        <CardTitle className="text-sm">Data Source</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription className="text-xs">
                        Import CSV data for training your network
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connecting Layers</h3>
                <p className="text-sm text-muted-foreground">
                  Connect layers by dragging from one node's handle to another.
                  This creates the pathways for data to flow through your
                  network.
                </p>
                <div className="flex items-center justify-center p-4">
                  <img
                    src="https://images.deepai.org/converted-papers/1712.06530/x1.png"
                    alt="Connecting Layers"
                    className="rounded-md border"
                  />
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span>
                      Drag from output handles (right side) to input handles
                      (left side)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                    <span>
                      Connections automatically create weights between neurons
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>
                      Animated connections show data flow during execution
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customizing Properties</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any node to edit its properties in the properties
                  panel.
                </p>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="weights">Weights</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Label:</span>
                        <span className="text-sm font-medium">
                          Hidden Layer
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Units:</span>
                        <span className="text-sm font-medium">4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Activation:</span>
                        <span className="text-sm font-medium">ReLU</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="weights" className="space-y-4 mt-4">
                    <div className="text-sm text-muted-foreground">
                      Adjust weights and biases to fine-tune your network
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="text-sm text-muted-foreground">
                      View current activation values and node position
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Running Your Network</h3>
                <p className="text-sm text-muted-foreground">
                  Use the controls to run your network and see how data flows
                  through it.
                </p>
                <div className="flex justify-center gap-2 my-4">
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Run
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Step
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Data Panel</div>
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Input Values</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Input 1:</span>
                          <span>0.75</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-3/4"></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Input 2:</span>
                          <span>0.25</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-1/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Training Your Network</h3>
                <p className="text-sm text-muted-foreground">
                  Use the training options to train your network on data.
                </p>
                <Card>
                  <CardHeader className="p-3">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      <CardTitle className="text-sm">
                        Training Options
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Learning Rate:</span>
                        <span>0.01</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-1/4"></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Epochs:</span>
                        <span>100</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    <Button size="sm" className="w-full">
                      Start Training
                    </Button>
                  </CardFooter>
                </Card>
                <div className="text-sm text-muted-foreground">
                  You can also import CSV data using the Data Source node to
                  train on your own datasets.
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-again"
              checked={showAgain}
              onCheckedChange={(checked) => setShowAgain(checked as boolean)}
            />
            <Label
              htmlFor="show-again"
              className="text-sm text-muted-foreground"
            >
              Show this walkthrough next time
            </Label>
          </div>
          <div className="flex space-x-2">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrevious} size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            <Button variant="outline" onClick={handleSkip} size="sm">
              Skip
            </Button>
            <Button onClick={handleNext} size="sm">
              {step < totalSteps ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
