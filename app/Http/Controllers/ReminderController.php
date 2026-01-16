<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReminderController extends Controller
{
    public function index()
    {
        $reminders = auth()->user()->reminders()
            ->with('category')
            ->orderBy('due_date')
            ->get()
            ->groupBy(function($reminder) {
                if ($reminder->isOverdue()) return 'overdue';
                if ($reminder->isDueToday()) return 'today';
                if ($reminder->isDueSoon()) return 'soon';
                if ($reminder->is_completed) return 'completed';
                return 'upcoming';
            });

        return Inertia::render('reminders/Index', [
            'reminders' => $reminders,
        ]);
    }

    public function create()
    {
        $categories = Category::where(function($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get();

        return Inertia::render('reminders/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'amount' => 'nullable|numeric|min:0',
            'due_date' => 'required|date',
            'is_recurring' => 'boolean',
            'frequency' => 'nullable|required_if:is_recurring,true|in:monthly,yearly',
        ]);

        auth()->user()->reminders()->create($validated);

        return redirect()->route('reminders.index');
    }

    public function update(Request $request, Reminder $reminder)
    {
        $this->authorize('update', $reminder);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'amount' => 'nullable|numeric|min:0',
            'due_date' => 'required|date',
            'is_recurring' => 'boolean',
            'frequency' => 'nullable|required_if:is_recurring,true|in:monthly,yearly',
        ]);

        $reminder->update($validated);

        return redirect()->route('reminders.index');
    }

    public function destroy(Reminder $reminder)
    {
        $this->authorize('delete', $reminder);
        
        $reminder->delete();

        return redirect()->route('reminders.index');
    }

    public function complete(Reminder $reminder)
    {
        $this->authorize('update', $reminder);

        $reminder->update([
            'is_completed' => true,
            'completed_at' => now(),
        ]);

        // If recurring, create next reminder
        if ($reminder->is_recurring && $reminder->frequency) {
            $nextDueDate = $reminder->frequency === 'monthly' 
                ? $reminder->due_date->addMonth()
                : $reminder->due_date->addYear();

            auth()->user()->reminders()->create([
                'title' => $reminder->title,
                'description' => $reminder->description,
                'category_id' => $reminder->category_id,
                'amount' => $reminder->amount,
                'due_date' => $nextDueDate,
                'is_recurring' => true,
                'frequency' => $reminder->frequency,
            ]);
        }

        return back();
    }
}
