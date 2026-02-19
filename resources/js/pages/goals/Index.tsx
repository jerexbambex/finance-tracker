import { Head, useForm } from '@inertiajs/react';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category?: string;
  is_completed: boolean;
  percentage: number;
}

interface Props {
  goals: Goal[];
}

export default function Index({ goals }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);

  const createForm = useForm({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '0',
    target_date: '',
    category: '',
  });

  const editForm = useForm({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: '',
  });

  const contributeForm = useForm({
    amount: '',
    note: '',
    contribution_date: new Date().toISOString().split('T')[0],
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/goals', {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.reset();
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      editForm.put(`/goals/${editingGoal.id}`, {
        onSuccess: () => {
          setEditOpen(false);
          setEditingGoal(null);
          editForm.reset();
        },
      });
    }
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (contributingGoal) {
      contributeForm.post(`/goals/${contributingGoal.id}/contribute`, {
        onSuccess: () => {
          setContributeOpen(false);
          setContributingGoal(null);
          contributeForm.reset();
        },
      });
    }
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    editForm.setData({
      name: goal.name,
      description: goal.description || '',
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date || '',
      category: goal.category || '',
    });
    setEditOpen(true);
  };

  const openContributeModal = (goal: Goal) => {
    setContributingGoal(goal);
    contributeForm.setData({
      amount: '',
      note: '',
      contribution_date: new Date().toISOString().split('T')[0],
    });
    setContributeOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <AppLayout>
      <Head title="Goals" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Financial Goals</h1>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>Create Goal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label htmlFor="create-name">Goal Name</Label>
                    <Input
                      id="create-name"
                      value={createForm.data.name}
                      onChange={(e) => createForm.setData('name', e.target.value)}
                      placeholder="e.g., Emergency Fund"
                    />
                    {createForm.errors.name && <p className="text-red-500 text-sm mt-1">{createForm.errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="create-target">Target Amount</Label>
                    <Input
                      id="create-target"
                      type="number"
                      step="0.01"
                      value={createForm.data.target_amount}
                      onChange={(e) => createForm.setData('target_amount', e.target.value)}
                      placeholder="0.00"
                    />
                    {createForm.errors.target_amount && <p className="text-red-500 text-sm mt-1">{createForm.errors.target_amount}</p>}
                  </div>
                  <div>
                    <Label htmlFor="create-current">Current Amount</Label>
                    <Input
                      id="create-current"
                      type="number"
                      step="0.01"
                      value={createForm.data.current_amount}
                      onChange={(e) => createForm.setData('current_amount', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-date">Target Date (Optional)</Label>
                    <Input
                      id="create-date"
                      type="date"
                      value={createForm.data.target_date}
                      onChange={(e) => createForm.setData('target_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-category">Category (Optional)</Label>
                    <Input
                      id="create-category"
                      value={createForm.data.category}
                      onChange={(e) => createForm.setData('category', e.target.value)}
                      placeholder="e.g., Savings, Vacation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-description">Description (Optional)</Label>
                    <Textarea
                      id="create-description"
                      value={createForm.data.description}
                      onChange={(e) => createForm.setData('description', e.target.value)}
                      placeholder="Additional notes"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createForm.processing}>
                      {createForm.processing ? 'Creating...' : 'Create Goal'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {goals.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Total Target</div>
                      <div className="text-2xl font-bold mt-2">{formatCurrency(totalTarget)}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Total Saved</div>
                      <div className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalSaved)}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Overall Progress</div>
                      <div className="text-2xl font-bold mt-2">{overallProgress.toFixed(0)}%</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeGoals.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {activeGoals.map((goal) => (
                  <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          {goal.category && (
                            <p className="text-xs text-muted-foreground mt-1">{goal.category}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(goal)}>
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                      
                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-2xl font-bold">{formatCurrency(goal.current_amount)}</span>
                          <span className="text-sm text-muted-foreground">of {formatCurrency(goal.target_amount)}</span>
                        </div>
                        <Progress value={Math.min(goal.percentage, 100)} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">
                          {goal.percentage.toFixed(0)}% complete
                        </p>
                      </div>

                      {goal.target_date && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Target: {formatDate(goal.target_date)}
                        </p>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => openContributeModal(goal)}
                      >
                        Update Progress
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {completedGoals.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-green-600">Completed Goals 🎉</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="border-green-500 bg-green-50 dark:bg-green-900/10">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          {goal.category && (
                            <p className="text-xs text-muted-foreground mt-1">{goal.category}</p>
                          )}
                        </div>
                        <span className="text-green-600 font-semibold text-sm">✓ Done</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(goal.current_amount)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Target: {formatCurrency(goal.target_amount)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {goals.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No goals set yet</p>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button>Create Your First Goal</Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Goal Name</Label>
              <Input
                id="edit-name"
                value={editForm.data.name}
                onChange={(e) => editForm.setData('name', e.target.value)}
              />
              {editForm.errors.name && <p className="text-red-500 text-sm mt-1">{editForm.errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="edit-target">Target Amount</Label>
              <Input
                id="edit-target"
                type="number"
                step="0.01"
                value={editForm.data.target_amount}
                onChange={(e) => editForm.setData('target_amount', e.target.value)}
              />
              {editForm.errors.target_amount && <p className="text-red-500 text-sm mt-1">{editForm.errors.target_amount}</p>}
            </div>
            <div>
              <Label htmlFor="edit-current">Current Amount</Label>
              <Input
                id="edit-current"
                type="number"
                step="0.01"
                value={editForm.data.current_amount}
                onChange={(e) => editForm.setData('current_amount', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Target Date (Optional)</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.data.target_date}
                onChange={(e) => editForm.setData('target_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category (Optional)</Label>
              <Input
                id="edit-category"
                value={editForm.data.category}
                onChange={(e) => editForm.setData('category', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={editForm.data.description}
                onChange={(e) => editForm.setData('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editForm.processing}>
                {editForm.processing ? 'Updating...' : 'Update Goal'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribute Modal */}
      <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContribute} className="space-y-4">
            <div>
              <Label htmlFor="contribute-amount">Amount</Label>
              <Input
                id="contribute-amount"
                type="number"
                step="0.01"
                value={contributeForm.data.amount}
                onChange={(e) => contributeForm.setData('amount', e.target.value)}
                placeholder="0.00"
              />
              {contributeForm.errors.amount && (
                <p className="text-red-500 text-sm mt-1">{contributeForm.errors.amount}</p>
              )}
            </div>
            <div>
              <Label htmlFor="contribute-date">Date</Label>
              <Input
                id="contribute-date"
                type="date"
                value={contributeForm.data.contribution_date}
                onChange={(e) => contributeForm.setData('contribution_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contribute-note">Note (Optional)</Label>
              <Textarea
                id="contribute-note"
                value={contributeForm.data.note}
                onChange={(e) => contributeForm.setData('note', e.target.value)}
                placeholder="Add a note about this contribution"
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setContributeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={contributeForm.processing}>
                {contributeForm.processing ? 'Adding...' : 'Add Contribution'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
