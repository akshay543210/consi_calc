import { Moon, Sun, Calculator, Twitter, MessageCircle, Users, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useState } from 'react';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="border-b bg-gradient-to-r from-background/95 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate">
                Trader Consistency Calculator
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Analyze your prop firm trading performance
              </p>
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Social Media Links */}
            <div className="flex items-center gap-2 mr-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://x.com/free_propfirm?s=09', '_blank')}
                className="w-9 h-9 p-0 hover:bg-blue-500/20 hover:text-blue-500 transition-all duration-300"
                title="Follow us on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://telegram.dog/free_propfirm_accounts', '_blank')}
                className="w-9 h-9 p-0 hover:bg-blue-500/20 hover:text-blue-500 transition-all duration-300"
                title="Join our Telegram"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://discord.gg/7MRsuqqT3n', '_blank')}
                className="w-9 h-9 p-0 hover:bg-purple-500/20 hover:text-purple-500 transition-all duration-300"
                title="Join our Discord"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-12 h-12 p-0 hover:bg-accent/50 transition-all duration-300"
            >
              <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 p-0 hover:bg-accent/50 transition-all duration-300"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 p-0 hover:bg-accent/50 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t bg-background/95 backdrop-blur"
          >
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://x.com/free_propfirm?s=09', '_blank')}
                  className="w-12 h-12 p-0 hover:bg-blue-500/20 hover:text-blue-500 transition-all duration-300"
                  title="Follow us on Twitter"
                >
                  <Twitter className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://telegram.dog/free_propfirm_accounts', '_blank')}
                  className="w-12 h-12 p-0 hover:bg-blue-500/20 hover:text-blue-500 transition-all duration-300"
                  title="Join our Telegram"
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://discord.gg/7MRsuqqT3n', '_blank')}
                  className="w-12 h-12 p-0 hover:bg-purple-500/20 hover:text-purple-500 transition-all duration-300"
                  title="Join our Discord"
                >
                  <Users className="h-6 w-6" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Analyze your prop firm trading performance
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;