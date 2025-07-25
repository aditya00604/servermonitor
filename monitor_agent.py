#!/usr/bin/env python3
"""
ServerWatch Linux Monitoring Agent

This script monitors CPU and memory usage on Linux servers and sends
the data to the ServerWatch API every hour.

Installation:
1. pip install psutil requests
2. Run with your API key: python monitor_agent.py --api-key YOUR_API_KEY --url https://your-domain.repl.co

Usage:
  python monitor_agent.py --api-key YOUR_API_KEY --url https://your-domain.repl.co
  python monitor_agent.py --api-key YOUR_API_KEY --url https://your-domain.repl.co --test
  python monitor_agent.py --help

The script will run continuously and send metrics every hour.
"""

import psutil
import requests
import time
import json
import logging
import argparse
import socket
import sys
import schedule
from datetime import datetime

# Global logger will be setup in main()
logger = None

class ServerMonitor:
    def __init__(self, api_key, api_url):
        global logger
        self.api_key = api_key
        self.api_url = f"{api_url}/{api_key}"
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'ServerWatch-Agent/1.0'
        })
        if logger is None:
            logger = logging.getLogger(__name__)
        
    def get_system_metrics(self):
        """Collect CPU and memory metrics from the system."""
        try:
            # Get CPU usage (average over 1 second)
            cpu_usage = psutil.cpu_percent(interval=1)
            
            # Get memory information
            memory = psutil.virtual_memory()
            memory_total = memory.total / (1024**3)  # Convert to GB
            memory_used = memory.used / (1024**3)    # Convert to GB
            memory_usage_percent = memory.percent
            
            # Get network IP (best effort)
            try:
                # Connect to a remote server to determine local IP
                with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                    s.connect(("8.8.8.8", 80))
                    local_ip = s.getsockname()[0]
            except Exception:
                local_ip = "127.0.0.1"
            
            metrics = {
                'cpuUsage': cpu_usage,
                'memoryUsage': memory_usage_percent,
                'memoryTotal': memory_total,
                'memoryUsed': memory_used,
                'ipAddress': local_ip,
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"Collected metrics - CPU: {cpu_usage:.1f}%, Memory: {memory_usage_percent:.1f}%")
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            return None
    
    def send_metrics(self, metrics):
        """Send metrics to the ServerWatch API."""
        try:
            response = self.session.post(
                self.api_url,
                json=metrics,
                timeout=30
            )
            
            if response.status_code == 200:
                logger.info("Metrics sent successfully")
                return True
            elif response.status_code == 401:
                logger.error("Invalid API key - please check your configuration")
                return False
            else:
                logger.error(f"Failed to send metrics - HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.ConnectionError:
            logger.error("Connection error - unable to reach ServerWatch API")
            return False
        except requests.exceptions.Timeout:
            logger.error("Timeout error - API request took too long")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending metrics: {e}")
            return False
    
    def collect_and_send(self):
        """Collect system metrics and send them to the API."""
        logger.info("Starting metrics collection...")
        
        metrics = self.get_system_metrics()
        if metrics is None:
            logger.error("Failed to collect metrics, skipping this cycle")
            return
        
        success = self.send_metrics(metrics)
        if success:
            logger.info("Metrics collection cycle completed successfully")
        else:
            logger.error("Failed to send metrics to ServerWatch")
    
    def run_scheduler(self):
        """Run the scheduled tasks."""
        logger.info("Starting ServerWatch monitoring agent...")
        logger.info(f"API URL: {self.api_url}")
        logger.info("Metrics will be collected every hour")
        
        # Send initial metrics
        self.collect_and_send()
        
        # Schedule metrics collection
        if hasattr(self, 'interval'):
            schedule.every(self.interval).seconds.do(self.collect_and_send)
        else:
            schedule.every().hour.do(self.collect_and_send)
        
        # Keep the scheduler running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def set_interval(self, interval_seconds):
        """Set custom monitoring interval."""
        self.interval = interval_seconds
    
    def test_connection(self):
        """Test the connection to ServerWatch API."""
        logger.info("Testing connection to ServerWatch API...")
        
        metrics = self.get_system_metrics()
        if metrics is None:
            logger.error("Cannot collect system metrics")
            return False
        
        success = self.send_metrics(metrics)
        if success:
            logger.info("Connection test successful!")
            return True
        else:
            logger.error("Connection test failed!")
            return False

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="ServerWatch Linux Monitoring Agent",
        epilog="Example: python monitor_agent.py --api-key YOUR_API_KEY --url https://your-domain.repl.co"
    )
    
    parser.add_argument(
        '--api-key', 
        required=True,
        help='Your server API key from ServerWatch dashboard'
    )
    
    parser.add_argument(
        '--url', 
        required=True,
        help='ServerWatch instance URL (e.g., https://your-domain.repl.co)'
    )
    
    parser.add_argument(
        '--test', 
        action='store_true',
        help='Test connection and exit (don\'t run continuously)'
    )
    
    parser.add_argument(
        '--interval',
        type=int,
        default=3600,
        help='Monitoring interval in seconds (default: 3600 = 1 hour)'
    )
    
    parser.add_argument(
        '--log-level',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        default='INFO',
        help='Set the logging level'
    )
    
    return parser.parse_args()

def setup_logging(log_level):
    """Setup logging configuration."""
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('serverwatch_agent.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def main():
    """Main function to run the monitoring agent."""
    
    # Parse command line arguments
    args = parse_arguments()
    
    # Setup logging
    logger = setup_logging(args.log_level)
    
    # Validate URL format
    api_url = args.url.rstrip('/')
    if not api_url.startswith(('http://', 'https://')):
        logger.error("URL must start with http:// or https://")
        sys.exit(1)
    
    # Create monitor instance
    monitor = ServerMonitor(args.api_key, f"{api_url}/api/metrics")
    
    # Test connection first
    logger.info("Testing connection to ServerWatch API...")
    if not monitor.test_connection():
        logger.error("Connection test failed. Please check your API key and URL.")
        sys.exit(1)
    
    # If test mode, exit after successful test
    if args.test:
        logger.info("Test completed successfully!")
        return
    
    try:
        # Update scheduler interval if specified
        if args.interval != 3600:
            logger.info(f"Using custom interval: {args.interval} seconds")
            monitor.set_interval(args.interval)
        
        # Run the monitoring loop
        monitor.run_scheduler()
    except KeyboardInterrupt:
        logger.info("Monitoring agent stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error in main loop: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
