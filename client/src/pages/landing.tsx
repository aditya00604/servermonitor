import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Server, Shield, BarChart, Crown } from "lucide-react";
// import { OtpForm } from "@/components/OtpForm";
import { SEOHead, seoConfigs } from "@/components/SEOHead";

export default function Landing() {
  return (
    <>
      <SEOHead {...seoConfigs.landing} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Server className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">ServerWatch</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor up to 10 Linux servers in real-time with comprehensive CPU and memory tracking.
            Professional monitoring made simple and free.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600">
                Track CPU and memory usage with hourly updates and beautiful visualizations.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-success text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Secure API key authentication and reliable data collection from your servers.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Server className="text-success text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Open Source</h3>
              <p className="text-gray-600">
                Free forever with unlimited servers. Self-host and customize as needed.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Always Free & Open Source</h2>
          <Card className="p-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Features</h3>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                      Up to 10 servers
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                      Real-time monitoring
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                      CPU & memory tracking
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                      Beautiful charts
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Open Source Benefits</h3>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Self-hosted
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Customizable
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      No vendor lock-in
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Community driven
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Login Options */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Started Free</h3>
            
            {/* Get Started Button */}
            <div className="space-y-4 mb-6">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-blue-700 text-white text-lg py-3"
                onClick={() => window.location.href = '/auth'}
              >
                Get Started Now
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">
              Already have an account? <a href="/auth" className="text-primary hover:underline">Sign in here</a>
            </p>
            
            <p className="text-sm text-gray-500 mt-6">
              No credit card required. Start monitoring 5 servers for free.
            </p>
            
            <p className="text-xs text-gray-400 mt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
