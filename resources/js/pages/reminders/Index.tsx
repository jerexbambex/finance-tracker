import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Plus, Trash2 } from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  due_date: string;
  is_recurring: boolean;
  frequency?: string;
  is_completed: boolean;
  category?: { id: string; name: string; color?: string };
}

interface Props {
  reminders: {
    overdue?: Reminder[];
    today?: Reminder[];
    soon?: Reminder[];
    upcoming?: Reminder[];
    completed?: Reminder[];
  };
}

export default function Index({ reminders }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleComplete = (id: string) => {
    router.post(`/reminders/${id}/complete`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      router.delete(`/reminders/${id}`);
    }
  };

  const ReminderCard = ({ reminder, variant }: { reminder: Reminder; variant: string }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{reminder.title}</h3>
          {reminder.is_recurring && (
            <Badge variant="outline" className="text-xs">
              {reminder.frequency}
            </Badge>
          )}
          {reminder.category && (
            <Badge variant="secondary" className="text-xs">
              {reminder.category.name}
            </Badge>
          )}
        </div>
        {reminder.description && (
          <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="text-muted-foreground">{formatDate(reminder.due_date)}</span>
          {reminder.amount && (
            <span className="font-medium">{formatCurrency(reminder.amount)}</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {!reminder.is_completed && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleComplete(reminder.id)}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDelete(reminder.id)}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <Head title="Reminders" />
      
      <div className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Bill Reminders</h1>
            <Link href="/reminders/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Reminder
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            {reminders.overdue && reminders.overdue.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-600">Overdue ({reminders.overdue.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reminders.overdue.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} variant="overdue" />
                  ))}
                </CardContent>
              </Card>
            )}

            {reminders.today && reminders.today.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-600">Due Today ({reminders.today.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reminders.today.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} variant="today" />
                  ))}
                </CardContent>
              </Card>
            )}

            {reminders.soon && reminders.soon.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-600">Due Soon (Next 7 Days) ({reminders.soon.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reminders.soon.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} variant="soon" />
                  ))}
                </CardContent>
              </Card>
            )}

            {reminders.upcoming && reminders.upcoming.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming ({reminders.upcoming.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reminders.upcoming.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} variant="upcoming" />
                  ))}
                </CardContent>
              </Card>
            )}

            {Object.keys(reminders).length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No reminders yet. Create one to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
