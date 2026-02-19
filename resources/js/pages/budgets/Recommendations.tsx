import { Head, router } from '@inertiajs/react';
import { TrendingUp, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';


interface Recommendation {
  category_id: string;
  category_name: string;
  category_color?: string;
  avg_spending: number;
  recommended_amount: number;
  has_budget: boolean;
}

interface Props {
  recommendations: Recommendation[];
}

export default function Recommendations({ recommendations }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleApply = (categoryId: string, amount: number) => {
    router.post('/budgets/recommendations/apply', {
      category_id: categoryId,
      amount: amount,
    });
  };

  return (
    <AppLayout>
      <Head title="Budget Recommendations" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Budget Recommendations</h1>
            <p className="text-muted-foreground">
              Based on your spending history over the last 3 months
            </p>
          </div>

          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No recommendations available. Start tracking expenses to get personalized budget suggestions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec) => (
                <Card key={rec.category_id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {rec.category_color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: rec.category_color }}
                        />
                      )}
                      <CardTitle className="text-lg">{rec.category_name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Average spending</p>
                      <p className="text-2xl font-bold">{formatCurrency(rec.avg_spending)}</p>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium">Recommended budget</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(rec.recommended_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        +10% buffer above average
                      </p>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handleApply(rec.category_id, rec.recommended_amount)}
                    >
                      Apply Budget
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
