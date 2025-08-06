import Navbar from '@/components/Navbar';
import TraderCalculator from '@/components/TraderCalculator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <TraderCalculator />
      </div>
    </div>
  );
};

export default Index;