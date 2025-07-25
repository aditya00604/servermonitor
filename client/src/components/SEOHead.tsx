import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
}

export function SEOHead({ 
  title = "ServerWatch - Linux Server Monitoring Platform | Real-time CPU & Memory Tracking",
  description = "Monitor your Linux servers in real-time with ServerWatch. Track CPU and memory usage, get alerts, and manage unlimited servers with our credit-based Pro plan. Start with 5 free servers.",
  keywords = "server monitoring, linux monitoring, cpu monitoring, memory monitoring, server management, infrastructure monitoring, devops tools, server health, system monitoring",
  canonicalUrl = "https://serverwatch.com",
  ogImage = "https://serverwatch.com/og-image.png",
  ogType = "website",
  structuredData
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph meta tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:url', canonicalUrl, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:site_name', 'ServerWatch', 'property');
    
    // Twitter meta tags
    updateMetaTag('twitter:card', 'summary_large_image', 'property');
    updateMetaTag('twitter:title', title, 'property');
    updateMetaTag('twitter:description', description, 'property');
    updateMetaTag('twitter:image', ogImage, 'property');
    updateMetaTag('twitter:url', canonicalUrl, 'property');
    
    // Canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);
    
    // Structured data
    if (structuredData) {
      let scriptElement = document.querySelector('script[type="application/ld+json"][data-dynamic]');
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        scriptElement.setAttribute('data-dynamic', 'true');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    }
    
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData]);

  return null; // This component doesn't render anything
}

// Pre-defined SEO configurations for different pages
export const seoConfigs = {
  landing: {
    title: "ServerWatch - Linux Server Monitoring Platform | Real-time CPU & Memory Tracking",
    description: "Monitor your Linux servers in real-time with ServerWatch. Track CPU and memory usage, get alerts, and manage unlimited servers with our credit-based Pro plan. Start with 5 free servers.",
    keywords: "server monitoring, linux monitoring, cpu monitoring, memory monitoring, server management, infrastructure monitoring, devops tools, server health, system monitoring, free server monitoring",
    canonicalUrl: "https://serverwatch.com",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "ServerWatch",
      "description": "Linux server monitoring platform with real-time CPU and memory tracking",
      "url": "https://serverwatch.com",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Linux",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1247"
      }
    }
  },
  
  dashboard: {
    title: "Server Dashboard - ServerWatch | Monitor Your Linux Servers",
    description: "View real-time server metrics, CPU usage, memory consumption, and manage your monitored Linux servers. Professional server monitoring dashboard with comprehensive analytics.",
    keywords: "server dashboard, linux monitoring dashboard, cpu metrics, memory metrics, server analytics, infrastructure monitoring dashboard",
    canonicalUrl: "https://serverwatch.com/dashboard",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "ServerWatch Dashboard",
      "description": "Real-time server monitoring dashboard",
      "url": "https://serverwatch.com/dashboard"
    }
  },
  
  servers: {
    title: "Server Management - ServerWatch | Add & Configure Linux Servers",
    description: "Add new Linux servers to monitor, configure monitoring agents, and manage your server infrastructure. Easy setup with downloadable Python monitoring scripts.",
    keywords: "add linux server, server configuration, monitoring agent setup, server management, linux server monitoring setup",
    canonicalUrl: "https://serverwatch.com/servers",
  },
  
  credits: {
    title: "Credits & Pro Plan - ServerWatch | Unlock More Server Monitoring",
    description: "Earn credits by watching ads or upgrade to Pro plan for unlimited server monitoring. Manage your ServerWatch credits and subscription plans.",
    keywords: "server monitoring credits, pro plan, unlimited server monitoring, subscription plans, serverwatch pricing",
    canonicalUrl: "https://serverwatch.com/credits",
  }
};