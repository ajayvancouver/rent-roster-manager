
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check if running in a Capacitor environment
    const isNative = typeof (window as any).Capacitor !== 'undefined';
    
    // Function to determine if mobile
    const checkIsMobile = () => {
      if (isNative) {
        // Always return true if in Capacitor environment
        return true;
      }
      // Use screen width for browser detection
      return window.innerWidth < MOBILE_BREAKPOINT;
    };

    // Set initial value
    setIsMobile(checkIsMobile());

    // Only add resize listener in browser environments
    if (!isNative) {
      const handleResize = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      };

      window.addEventListener("resize", handleResize);
      
      // Clean up event listener
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [])

  return isMobile
}
